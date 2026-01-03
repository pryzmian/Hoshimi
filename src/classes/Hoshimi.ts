import { EventEmitter } from "node:events";

import {
    type ChannelDeletePacket,
    type ClientData,
    DebugLevels,
    type DeepRequired,
    DestroyReasons,
    Events,
    type HoshimiEvents,
    type HoshimiOptions,
    type QueryResult,
    SearchEngines,
    type SearchOptions,
    type VoicePacket,
    type VoiceServer,
    type VoiceState,
} from "../types/Manager";
import { type LavalinkSearchResponse, LoadType, State } from "../types/Node";
import type { LavalinkPlayerVoice, PlayerOptions } from "../types/Player";
import { type NodeManagerStructure, type NodeStructure, type PlayerStructure, Structures } from "../types/Structures";
import { Collection } from "../util/collection";
import { HoshimiAgent } from "../util/constants";
import { autoplayFn } from "../util/functions/autoplay";
import { stringify, validateManagerOptions } from "../util/functions/utils";
import { ManagerError, OptionError } from "./Errors";
import { MemoryAdapter } from "./queue/adapters/memory";
import { Track } from "./Track";

/**
 * The packet type for the manager.
 */
type GatewayPackets = VoicePacket | VoiceServer | VoiceState | ChannelDeletePacket;

/**
 * The required options for the manager.
 */
type RequiredOptions = DeepRequired<HoshimiOptions>;

/**
 * The events for the manager.
 * This allows to extend the events.
 */
type RawEvents = {
    [K in keyof HoshimiEvents]: HoshimiEvents[K];
};

/**
 * Class representing the Hoshimi manager.
 * @class Hoshimi
 * @extends {EventEmitter<RawEvents>}
 */
export class Hoshimi extends EventEmitter<RawEvents> {
    /**
     * The options for the manager.
     * @type {HoshimiOptions}
     */
    public options: RequiredOptions;

    /**
     * The players for the manager.
     * @type {Collection<string, PlayerStructure>}
     * @readonly
     */
    readonly players: Collection<string, PlayerStructure> = new Collection();

    /**
     * THe node manager for the manager.
     * @type {NodeManager}
     * @readonly
     */
    readonly nodeManager: NodeManagerStructure;

    /**
     * If the manager is ready.
     * @type {boolean}
     */
    public ready: boolean = false;

    /**
     * The constructor for the manager.
     * @param {HoshimiOptions} options The options for the manager.
     * @throws {ManagerError} If the options are not provided.
     * @example
     * ```ts
     * const manager = new Hoshimi({
     * 	nodes: [
     * 		{
     * 			host: "localhost",
     * 			port: 2333,
     * 			password: "youshallnotpass",
     * 			secure: false,
     * 		},
     * 	],
     * 	client: {
     * 		id: "clientId",
     * 		username: "clientUsername",
     * 	},
     * 	defaultSearchEngine: SearchEngines.Youtube,
     * 	restOptions: {
     * 		resumeTimeout: 10000,
     * 	},
     * 	nodeOptions: {
     * 		userAgent: HoshimiAgent,
     * 		resumable: false,
     * 		resumeByLibrary: false,
     * 	},
     * 	queueOptions: {
     * 		maxPreviousTracks: 25,
     * 		autoplayFn: autoplayFn,
     * 		autoPlay: false,
     * 	},
     * });
     *
     * console.log(manager); // The manager instance
     * ```
     */
    constructor(options: HoshimiOptions) {
        super();

        if (!options) throw new ManagerError("You must provide the options for the manager.");

        this.options = {
            ...options,
            defaultSearchEngine: options.defaultSearchEngine ?? SearchEngines.Youtube,
            restOptions: {
                resumeTimeout: options.restOptions?.resumeTimeout ?? 10000,
            },
            nodeOptions: {
                userAgent: options.nodeOptions?.userAgent ?? HoshimiAgent,
                resumable: options.nodeOptions?.resumable ?? false,
                resumeByLibrary: options.nodeOptions?.resumeByLibrary ?? false,
                resumeTimeout: options.nodeOptions?.resumeTimeout ?? 10000,
            },
            queueOptions: {
                maxHistory: options.queueOptions?.maxHistory ?? 25,
                autoplayFn: options.queueOptions?.autoplayFn ?? autoplayFn,
                autoPlay: options.queueOptions?.autoPlay ?? false,
                storage: options.queueOptions?.storage ?? new MemoryAdapter(),
            },
            playerOptions: {
                onDisconnect: {
                    autoDestroy: options.playerOptions?.onDisconnect?.autoDestroy ?? false,
                    autoReconnect: options.playerOptions?.onDisconnect?.autoReconnect ?? true,
                    autoQueue: options.playerOptions?.onDisconnect?.autoQueue ?? false,
                },
                onError: {
                    autoDestroy: options.playerOptions?.onError?.autoDestroy ?? false,
                    autoSkip: options.playerOptions?.onError?.autoSkip ?? false,
                    autoStop: options.playerOptions?.onError?.autoStop ?? false,
                },
            },
            client: {
                id: options.client?.id ?? "",
                username: options.client?.username ?? "hoshimi-client",
            },
        };

        validateManagerOptions(this.options);

        this.nodeManager = Structures.NodeManager(this);
    }

    /**
     * Check if the manager is useable.
     * @returns {boolean} If the manager is useable.
     * @example
     * ```ts
     * if (manager.isUseable()) {
     * 	console.log("The manager is useable.");
     * } else {
     * 	console.log("The manager is not useable.");
     * }
     * ```
     */
    public isUseable(): boolean {
        const nodes = this.nodeManager.nodes.filter((node) => node.state === State.Connected);
        return this.ready && nodes.length > 0;
    }

    /**
     *
     * Get the player for the guild.
     * @param {string} guildId The guild id to get the player.
     * @returns {PlayerStructure | undefined} The player for the guild.
     * @example
     * ```ts
     * const player = manager.getPlayer(guildId);
     * if (player) {
     * 	console.log(`The player for ${guildId} is ${player}`);
     * } else {
     * 	console.log(`The player for ${guildId} is not found.`);
     * }
     * ```
     */
    public getPlayer(guildId: string): PlayerStructure | undefined {
        return this.players.get(guildId);
    }

    /**
     * Delete the player for the guild.
     * @param {string} guildId The guild id to delete the player.
     * @returns {boolean} If the player was deleted.
     * @example
     * ```ts
     * const player = manager.deletePlayer(guildId);
     * if (player) {
     * 	console.log(`The player for ${guildId} was deleted.`);
     * } else {
     * 	console.log(`The player for ${guildId} was not found.`);
     * }
     * ```
     */
    public deletePlayer(guildId: string): boolean {
        return this.players.delete(guildId);
    }

    /**
     *
     * Handle the raw packet for voice state and voice server updates.
     * @param {GatewayPackets} packet The packet to handle
     * @returns {Promise<void>}
     * @example
     * ```ts
     * client.on("raw", (packet) => manager.updateVoiceState(packet));
     * ```
     */
    public async updateVoiceState(packet: GatewayPackets): Promise<void> {
        if (!this.ready) {
            this.emit(Events.Debug, DebugLevels.Player, "[Player] -> [Manager] The manager is not ready.");
            return;
        }

        if (!("t" in packet)) {
            this.emit(Events.Debug, DebugLevels.Player, "[Player] -> [Voice] The packet does not have a type.");
            return;
        }

        switch (packet.t) {
            case "CHANNEL_DELETE": {
                const data = packet.d;

                const player = this.getPlayer(data.guild_id);
                if (!player) {
                    this.emit(Events.Debug, DebugLevels.Player, "[Player] -> [Voice] The player is not found.");
                    return;
                }

                if (data.id === player.voiceId) {
                    this.emit(
                        Events.Debug,
                        DebugLevels.Player,
                        `[Player] -> [Voice] The channel ${data.id} was deleted, disconnecting the player.`,
                    );

                    await player.destroy(DestroyReasons.VoiceChannelDeleted);
                } else {
                    this.emit(
                        Events.Debug,
                        DebugLevels.Player,
                        `[Player] -> [Voice] The channel ${data.id} was deleted, but it is not the player's channel.`,
                    );
                }

                break;
            }

            case "VOICE_SERVER_UPDATE":
            case "VOICE_STATE_UPDATE":
                {
                    const data = packet.d;

                    if (!("guild_id" in data)) {
                        this.emit(Events.Debug, DebugLevels.Player, "[Player] -> [Voice] The guild id is missing.");
                        return;
                    }

                    if ("user_id" in data && data.user_id !== this.options.client?.id) {
                        this.emit(Events.Debug, DebugLevels.Player, "[Player] -> [Voice] The user id does not match the client id.");
                        return;
                    }

                    const player = this.getPlayer(data.guild_id);
                    if (!player) {
                        this.emit(Events.Debug, DebugLevels.Player, "[Player] -> [Voice] The player is not found.");
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
                                voice: player.voice as LavalinkPlayerVoice,
                            },
                        });

                        this.emit(
                            Events.Debug,
                            DebugLevels.Player,
                            `[Player] -> [Voice] Updated the player voice for: ${data.guild_id} | Session: ${player.voice.sessionId} | Token: ${player.voice.token} | Endpoint: ${player.voice.endpoint}`,
                        );

                        return;
                    }

                    if ("channel_id" in data && typeof data.channel_id === "string") {
                        if (data.channel_id !== player.voiceId) {
                            this.emit(
                                Events.Debug,
                                DebugLevels.Player,
                                `[Player] -> [Voice] Updating the voice channel for: ${data.guild_id} | Old: ${player.voiceId} | New: ${data.channel_id}`,
                            );

                            player.voice.sessionId = data.session_id ?? player.voice.sessionId;

                            player.voiceId = data.channel_id;
                            player.options.voiceId = data.channel_id;

                            if (!player.connected) await player.connect();

                            return;
                        }
                    } else {
                        this.emit(Events.Debug, DebugLevels.Player, `[Player] -> [Voice] The channel id is missing for: ${data.guild_id}`);

                        const { autoDestroy, autoReconnect, autoQueue } = this.options.playerOptions.onDisconnect;

                        if (autoDestroy) {
                            await player.destroy(DestroyReasons.VoiceChannelLeft);
                            return;
                        }

                        if (autoReconnect) {
                            try {
                                const position = player.position;
                                const paused = player.paused;

                                this.emit(
                                    Events.Debug,
                                    DebugLevels.Player,
                                    `[Player] -> [Voice] Attempting to reconnect the player for: ${data.guild_id}`,
                                );

                                if (autoQueue && player.queue.current && !player.queue.isEmpty()) await player.connect();

                                if (player.queue.current) return player.play({ track: player.queue.current, paused, position });
                                if (!player.queue.isEmpty()) return player.play({ paused });

                                this.emit(
                                    Events.Debug,
                                    DebugLevels.Player,
                                    `[Player] -> [Voice] No tracks to play after reconnect for: ${data.guild_id}`,
                                );
                            } catch (error) {
                                this.emit(Events.PlayerError, player, error);
                                await player.destroy(DestroyReasons.ReconnectFailed);
                            }
                        }

                        player.voiceId = undefined;
                        player.voice = Object.create({});

                        return;
                    }

                    this.emit(Events.Debug, DebugLevels.Player, `[Player] -> [Voice] The player voice is missing for: ${data.guild_id}`);
                }
                break;

            default:
                break;
        }
    }

    /**
     *
     * Initialize the manager.
     * @param {ClientData} info The client data to use.
     * @returns {void}
     * @example
     * ```ts
     * manager.init({
     * 	id: "clientId",
     * 	username: "clientUsername",
     * });
     * ```
     */
    public init(info: ClientData): void {
        if (this.ready) return;

        this.options.client = {
            ...this.options.client,
            ...info,
        };

        if (!this.options.client.id) throw new ManagerError("You must provide the client id.");
        if (typeof this.options.client.id !== "string") throw new OptionError("The client info 'info.client.id': must be a string.");

        let amount = 0;

        for (const options of this.options.nodes) {
            const node = this.nodeManager.create(options);

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
     * @example
     * ```ts
     * const player = manager.createPlayer({
     * 	guildId: "guildId",
     * 	voiceId: "voiceId",
     * });
     *
     * console.log(player); // The created player
     *
     * player.connect();
     * player.play(track);
     * ```
     */
    public createPlayer(options: PlayerOptions): PlayerStructure {
        const oldPlayer: PlayerStructure | undefined = this.getPlayer(options.guildId);
        if (oldPlayer) return oldPlayer;

        const player = Structures.Player(this, options);

        this.players.set(options.guildId, player);
        this.emit(Events.PlayerCreate, player);

        return player;
    }

    /**
     *
     * Search for a track or playlist.
     * @param {SearchOptions} options The options for the search.
     * @returns {Promise<QueryResult>} The search result.
     * @example
     * ```ts
     * const result = await manager.search({
     * 	query: "track name",
     * 	engine: SearchEngines.Youtube,
     * });
     *
     * console.log(result); // The search result
     * ```
     */
    public async search(options: SearchOptions): Promise<QueryResult> {
        let node: NodeStructure | null = null;

        if (options.node) {
            const nodeId: string = typeof options.node === "string" ? options.node : options.node.id;

            node = this.nodeManager.get(nodeId) ?? null;
        } else {
            node = this.nodeManager.getLeastUsed();
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
            `[Manager] -> [Search] Searching for: ${options.query} (${options.engine ?? "unknown"}) | Result: ${stringify(res)}`,
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

/**
 * Create a new Hoshimi instance.
 * @param {ConstructorParameters<typeof Hoshimi>} args The arguments for the constructor.
 * @returns {Hoshimi} The new Hoshimi instance.
 */
export function createHoshimi(...args: ConstructorParameters<typeof Hoshimi>): Hoshimi {
    return new Hoshimi(...args);
}
