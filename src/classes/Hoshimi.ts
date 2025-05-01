import { TypedEmitter } from "../util/emitter";

import {
	type ClientData,
	SearchEngines,
	type HoshimiEvents,
	type HoshimiOptions,
	type SearchResult,
	type SearchOptions,
	type VoicePacket,
	type VoiceServer,
	type VoiceState,
	type ChannelDeletePacket,
	DebugLevels,
	Events,
} from "../types/Manager";
import { type LavalinkSearchResponse, LoadType, State } from "../types/Node";
import type { PlayerOptions } from "../types/Player";
import type { Node } from "./node/Node";

import { Player } from "./Player";
import { Collection } from "../util/collection";
import { validateManagerOptions } from "../util/functions/validations";
import { ManagerError, OptionError } from "./Errors";
import { Track } from "./Track";
import { autoplayFn } from "../util/functions/autoplay";
import { HoshimiAgent } from "../util/constants";
import { NodeManager } from "./node/Manager";

/**
 * The packet type for the manager.
 */
type GatewayPackets = VoicePacket | VoiceServer | VoiceState | ChannelDeletePacket;

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
	 * The players for the manager.
	 * @type {Collection<string, Player>}
	 * @readonly
	 */
	readonly players: Collection<string, Player> = new Collection();

	/**
	 * THe node manager for the manager.
	 * @type {NodeManager}
	 * @readonly
	 */
	readonly nodeManager: NodeManager;

	/**
	 * If the manager is ready.
	 * @type {boolean}
	 */
	public ready: boolean = false;

	/**
	 * The constructor for the manager.
	 * @param {HoshimiOptions} options The options for the manager.
	 */
	constructor(options: HoshimiOptions) {
		super();

		if (!options) throw new ManagerError("You must provide the options for the manager.");

		this.options = {
			...options,
			defaultSearchEngine: options.defaultSearchEngine ?? SearchEngines.Youtube,
			nodeOptions: {
				userAgent: options.nodeOptions?.userAgent ?? HoshimiAgent,
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

		this.nodeManager = new NodeManager(this);

		validateManagerOptions(this.options);
	}

	/**
	 * Check if the manager is useable.
	 * @returns {boolean} If the manager is useable.
	 */
	public isUseable(): boolean {
		const nodes = this.nodeManager.nodes.filter((node) => node.state === State.Connected);
		return this.ready && nodes.length > 0;
	}

	/**
	 *
	 * Get the player for the guild.
	 * @param {string} guildId The guild id to get the player.
	 * @returns {Player | undefined} The player for the guild.
	 */
	public getPlayer(guildId: string): Player | undefined {
		return this.players.get(guildId);
	}

	/**
	 * Delete the player for the guild.
	 * @param {string} guildId The guild id to delete the player.
	 * @returns {boolean} If the player was deleted.
	 */
	public deletePlayer(guildId: string): boolean {
		return this.players.delete(guildId);
	}

	/**
	 *
	 * Handle the raw packet.
	 * @param {GatewayPackets} packet The packet to handle
	 * @returns {Promise<void>}
	 */
	public async sendRaw(packet: GatewayPackets): Promise<void> {
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

					// this is the most funny thing i've ever made.
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
	 * @param {ClientData} info The client data to use.
	 * @returns {void}
	 */
	public init(info: ClientData): void {
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
			const node = this.nodeManager.createNode(options);

			try {
				node.connect();
				amount++;
			} catch (error) {
				this.emit(Events.NodeError, node, error);
			}
		}

		this.ready = amount > 0;
		this.emit(
			Events.Debug,
			DebugLevels.Player,
			`[Manager] -> [Init] The manager is ready: ${this.ready} | Nodes: ${amount} of ${this.nodeManager.nodes.size}`,
		);
	}

	/**
	 *
	 * Create a new player.
	 * @param {PlayerOptions} options The options for the player.
	 * @returns {Player} The created player.
	 */
	public createPlayer(options: PlayerOptions): Player {
		const oldPlayer: Player | undefined = this.getPlayer(options.guildId);
		if (oldPlayer) return oldPlayer;

		const player = new Player(this, options);

		this.emit(Events.PlayerCreate, player);
		this.players.set(options.guildId, player);

		return player;
	}

	/**
	 *
	 * Search for a track or playlist.
	 * @param {SearchOptions} options The options for the search.
	 * @returns {Promise<SearchResult>} The search result.
	 */
	public async search(options: SearchOptions): Promise<SearchResult> {
		let node: Node | null = null;

		if (options.node) {
			const nodeId: string =
				typeof options.node === "string" ? options.node : options.node.id;

			node = this.nodeManager.getNode(nodeId) ?? null;
		} else {
			node = this.nodeManager.getLeastUsedNode();
		}

		if (!node) throw new ManagerError("No nodes are available.");

		const res: LavalinkSearchResponse | null = await node.search(options);
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
			DebugLevels.Manager,
			`[Manager] -> [Search] Searching for: ${options.query} (${options.engine ?? this.options.defaultSearchEngine}) | Result: ${JSON.stringify(res)}`,
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
