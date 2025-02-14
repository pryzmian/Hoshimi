import { TypedEmitter } from "../util/emitter";

import {
	type ClientData,
	SearchEngines,
	type HoshimiEvents,
	type HoshimiOptions,
	type SearchResult,
	type QueryOptions,
	type VoicePacket,
	type VoiceServer,
	type VoiceState,
	type ChannelDeletePacket,
	DebugLevels,
	Events,
} from "../types/Manager";
import { LoadType, State, type NodeOptions } from "../types/Node";
import type { LavalinkPlayerVoice, PlayerOptions } from "../types/Player";
import { Player } from "./Player";

import { Node } from "./node/Node";

import { Collection } from "../util/collection";
import { validateManagerOptions } from "../util/functions/validations";
import { ManagerError, OptionError } from "./Errors";
import { Track } from "./Track";
import { autoplayFn } from "../util/functions/autoplay";

/**
 * The events for the manager.
 * This allows to extend the events.
 */
type RawEvents = {
	[K in keyof HoshimiEvents]: HoshimiEvents[K];
};

/**
 * Class representing the Hoshimi manager.
 */
export class Hoshimi extends TypedEmitter<RawEvents> {
	/**
	 * The options for the manager.
	 * @type {HoshimiOptions}
	 */
	public options: Required<HoshimiOptions>;

	/**
	 * The nodes for the manager.
	 * @type {Collection<string, Node>}
	 */
	readonly nodes: Collection<string, Node> = new Collection();
	/**
	 * The players for the manager.
	 * @type {Collection<string, Player>}
	 */
	readonly players: Collection<string, Player> = new Collection();

	/**
	 * If the manager is ready.
	 * @type {boolean}
	 */
	public ready: boolean = false;

	/**
	 * The constructor for the manager.
	 * @param options The options for the manager.
	 */
	constructor(options: HoshimiOptions) {
		super();

		if (!options) throw new ManagerError("You must provide the options for the manager.");

		this.options = {
			...options,
			defaultSearchEngine: options.defaultSearchEngine ?? SearchEngines.Youtube,
			nodeOptions: {
				resumable: options.nodeOptions?.resumable ?? false,
				resumeByLibrary: options.nodeOptions?.resumeByLibrary ?? false,
				resumeTimeout: options.nodeOptions?.resumeTimeout ?? 5000,
			},
			queueOptions: {
				maxPreviousTracks: options.queueOptions?.maxPreviousTracks ?? 25,
				autoplayFn: options.queueOptions?.autoplayFn ?? autoplayFn,
				autoPlay: options.queueOptions?.autoPlay ?? false,
			},
			client: {
				id: options.client?.id,
				username: options.client?.username ?? "hoshimi-client",
			},
		};

		validateManagerOptions(this.options);
	}

	/**
	 * Check if the manager is useable.
	 * @returns {boolean} If the manager is useable.
	 */
	public isUseable(): boolean {
		const nodes = this.nodes.filter((node) => node.state === State.Connected);
		return this.ready && nodes.length > 0;
	}

	/**
	 *
	 * Get the least used node.
	 * @returns {Node} The least used node.
	 */
	public getLeastUsedNode(): Node {
		const nodes = this.nodes.filter((node) => node.state === State.Connected);
		return nodes.reduce((a, b) => (a.penalties < b.penalties ? a : b));
	}

	/**
	 *
	 * Get the player for the guild.
	 * @param guildId The guild id to get the player.
	 * @returns {Player | undefined} The player for the guild.
	 */
	public getPlayer(guildId: string): Player | undefined {
		return this.players.get(guildId);
	}

	/**
	 * Delete the player for the guild.
	 */
	public deletePlayer(guildId: string): boolean {
		return this.players.delete(guildId);
	}

	/**
	 *
	 * Handle the raw packet.
	 * @param packet The packet to handle
	 * @returns
	 */
	public async sendRaw(
		packet: VoicePacket | VoiceServer | VoiceState | ChannelDeletePacket,
	): Promise<void> {
		if (!this.ready) {
			this.emit(
				Events.Debug,
				DebugLevels.Player,
				"[Player] -> [Manager] The manager is not ready.",
			);
			return;
		}

		if (!("t" in packet)) {
			this.emit(
				Events.Debug,
				DebugLevels.Player,
				"[Player] -> [Voice] The packet does not have a type.",
			);
			return;
		}

		switch (packet.t) {
			case "VOICE_SERVER_UPDATE":
			case "VOICE_STATE_UPDATE":
				{
					const data = packet.d;

					if (!("guild_id" in data)) {
						this.emit(
							Events.Debug,
							DebugLevels.Player,
							"[Player] -> [Voice] The guild id is missing.",
						);
						return;
					}

					if ("user_id" in data && data.user_id !== this.options.client?.id) {
						this.emit(
							Events.Debug,
							DebugLevels.Player,
							"[Player] -> [Voice] The user id does not match the client id.",
						);
						return;
					}

					const player = this.getPlayer(data.guild_id);
					if (!player) {
						this.emit(
							Events.Debug,
							DebugLevels.Player,
							"[Player] -> [Voice] The player is not found.",
						);
						return;
					}

					if ("session_id" in data) player.voice.sessionId = data.session_id;
					if ("token" in data) player.voice.token = data.token;
					if ("endpoint" in data) player.voice.endpoint = data.endpoint;

					if (player.voice.sessionId && player.voice.token && player.voice.endpoint) {
						await player.node.updatePlayer({
							guildId: data.guild_id,
							playerOptions: {
								voice: {
									endpoint: player.voice.endpoint,
									sessionId: player.voice.sessionId,
									token: player.voice.token,
								},
							},
						});

						this.emit(
							Events.Debug,
							DebugLevels.Player,
							`[Player] -> [Voice] Updated the player voice for: ${data.guild_id} | Session: ${player.voice.sessionId} | Token: ${player.voice.token} | Endpoint: ${player.voice.endpoint}`,
						);

						return;
					}

					this.emit(
						Events.Debug,
						DebugLevels.Player,
						`[Player] -> [Voice] The player voice is missing for: ${data.guild_id}`,
					);
				}
				break;
		}
	}

	/**
	 *
	 * Initialize the manager.
	 * @param info The client data to use.
	 * @returns {Promise<void>}
	 */
	public async init(info: ClientData): Promise<void> {
		if (this.ready) return;

		this.options.client = {
			...this.options.client,
			...info,
		};

		if (!this.options.client.id) throw new ManagerError("You must provide the client id.");
		if (typeof this.options.client.id !== "string")
			throw new OptionError("The client info 'info.client.id': must be a string.");

		let amount = 0;

		for (const options of this.options.nodes) {
			const node = this.createNode(options);

			try {
				await node.connect();
				amount++;
			} catch (error) {
				this.emit(Events.NodeError, node, error);
			}
		}

		this.ready = amount > 0;
		this.emit(
			Events.Debug,
			DebugLevels.Player,
			`[Manager] -> [Init] The manager is ready: ${this.ready} | Nodes: ${amount} of ${this.nodes.size}`,
		);
	}

	/**
	 *
	 * Create a new node.
	 * @param options The options for the node.
	 * @returns {Node} The created node.
	 */
	public createNode(options: NodeOptions): Node {
		if (this.nodes.has(options.id ?? `${options.host}:${options.port}`))
			return this.nodes.get(options.id ?? `${options.host}:${options.port}`)!;

		const node = new Node(this, options);
		this.nodes.set(node.id, node);
		return node;
	}

	/**
	 *
	 * Create a new player.
	 * @param options The options for the player.
	 * @returns
	 */
	public createPlayer(options: PlayerOptions): Player {
		if (this.players.has(options.guildId)) return this.players.get(options.guildId)!;

		const player = new Player(this, options);

		this.emit(Events.PlayerCreate, player);
		this.players.set(options.guildId, player);

		return player;
	}

	/**
	 *
	 * Search for a track or playlist.
	 * @param options The options for the search.
	 * @returns
	 */
	public async search(options: QueryOptions): Promise<SearchResult> {
		let node: Node | null = null;

		if (options.node) {
			const nodeId = typeof options.node === "string" ? options.node : options.node.id;
			node = this.nodes.get(nodeId) ?? null;
		} else {
			node = this.getLeastUsedNode();
		}

		if (!node) throw new ManagerError("No nodes are available.");

		const res = await node.search(options);
		if (!res)
			return {
				loadType: LoadType.Empty,
				exception: null,
				playlist: null,
				pluginInfo: null,
				tracks: [],
			};

		this.emit(
			Events.Debug,
			DebugLevels.Player,
			`[Player] -> [Search] Searching for: ${options.query} (${options.engine ?? this.options.defaultSearchEngine}) | Result: ${JSON.stringify(res)}`,
		);

		switch (res.loadType) {
			case LoadType.Empty: {
				return {
					loadType: res.loadType,
					exception: null,
					playlist: null,
					pluginInfo: null,
					tracks: [],
				};
			}

			case LoadType.Error: {
				return {
					loadType: res.loadType,
					exception: res.data,
					playlist: null,
					pluginInfo: null,
					tracks: [],
				};
			}

			case LoadType.Playlist: {
				return {
					loadType: res.loadType,
					exception: null,
					playlist: res.data,
					pluginInfo: res.data.pluginInfo,
					tracks: res.data.tracks.map((t) => new Track(t, options.requester)),
				};
			}

			case LoadType.Search: {
				return {
					loadType: res.loadType,
					exception: null,
					playlist: null,
					pluginInfo: null,
					tracks: res.data.map((t) => new Track(t, options.requester)),
				};
			}

			case LoadType.Track: {
				return {
					loadType: res.loadType,
					exception: null,
					playlist: null,
					pluginInfo: res.data.pluginInfo,
					tracks: [new Track(res.data, options.requester)],
				};
			}
		}
	}
}
