import { DebugLevels, DestroyReasons, Events, type Nullable, type SearchOptions, type QueryResult } from "../../types/Manager";
import type { LyricsResult } from "../../types/Node";
import {
    type LavalinkPlayerVoice,
    LoopMode,
    type LyricsMethods,
    type PlayOptions,
    type PlayerJson,
    type PlayerOptions,
} from "../../types/Player";
import { Structures, type NodeStructure, type QueueStructure } from "../../types/Structures";
import { isTrack, isUnresolvedTrack, validateTrack, validatePlayerOptions } from "../../util/functions/utils";
import { PlayerError } from "../Errors";
import type { Hoshimi } from "../Hoshimi";
import { PlayerStorage } from "./Storage";

/**
 * Class representing a Hoshimi player.
 * @class Player
 */
export class Player {
    /**
     * The data for the player.
     * @type {PlayerStorage}
     * @readonly
     */
    readonly data: PlayerStorage = new PlayerStorage();

    /**
     * The options for the player.
     * @type {PlayerOptions}
     * @readonly
     */
    readonly options: PlayerOptions;

    /**
     * The manager for the player.
     * @type {Hoshimi}
     * @readonly
     */
    readonly manager: Hoshimi;

    /**
     * The queue for the player.
     * @type {Queue}
     * @readonly
     */
    readonly queue: QueueStructure;

    /**
     * Check if the player is self deafened.
     * @type {boolean}
     */
    public selfDeaf: boolean = false;

    /**
     * Check if the player is self muted.
     * @type {boolean}
     */
    public selfMute: boolean = false;

    /**
     * Loop mode of the player.
     * @type {LoopMode}
     * @default LoopMode.Off
     */
    public loop: LoopMode = LoopMode.Off;

    /**
     * Check if the player is playing.
     * @type {boolean}
     * @default false
     */
    public playing: boolean = false;

    /**
     * Check if the player is paused.
     * @type {boolean}
     * @default false
     */
    public paused: boolean = false;

    /**
     * Check if the player is connected.
     * @type {boolean}
     * @default false
     */
    public connected: boolean = false;

    /**
     * Volume of the player.
     * @type {number}
     * @default 100
     */
    public volume: number = 100;

    /**
     * Guild ig of the player.
     * @type {string}
     */
    public guildId: string;

    /**
     * Voice channel idof the player.
     * @type {string | undefined}
     */
    public voiceId: string | undefined = undefined;

    /**
     * Text channel id of the player.
     * @type {string | undefined}
     */
    public textId: string | undefined = undefined;

    /**
     * The ping of the player.
     * @type {number}
     */
    public ping: number = 0;

    /**
     * The timestamp when the player was created.
     * @type {number}
     */
    public createdTimestamp: number = 0;

    /**
     * The position of the player.
     * @type {number}
     */
    public position: number = 0;

    /**
     * The voice connection details.
     * @type {PlayerVoice}
     */
    public voice: Nullable<LavalinkPlayerVoice> = {
        endpoint: null,
        sessionId: null,
        token: null,
    };

    /**
     *
     * Create a new player.
     * @param {Hoshimi} manager The manager for the player.
     * @param {PlayOptions} options The options for the player.
     * @example
     * ```ts
     * const player = new Player(manager, {
     * 	guildId: "guildId",
     * 	voiceId: "voiceId",
     * 	textId: "textId",
     * 	selfDeaf: true,
     * 	selfMute: false,
     * 	volume: 100,
     * });
     *
     * console.log(player.guildId); // guildId
     * console.log(player.voiceId); // voiceId
     * console.log(player.textId); // textId
     */
    constructor(manager: Hoshimi, options: PlayerOptions) {
        this.manager = manager;
        this.options = options;

        this.guildId = options.guildId;
        this.voiceId = options.voiceId;

        this.selfDeaf = options.selfDeaf ?? true;
        this.selfMute = options.selfMute ?? false;
        this.volume = options.volume ?? 100;
        this.textId = options.textId;

        validatePlayerOptions(this.options);

        this.queue = Structures.Queue(this);
    }

    /**
     * The lyrics methods for the player.
     * @type {LyricsMethods}
     * @readonly
     */
    readonly lyrics: LyricsMethods = {
        subscribe: (skipSource): Promise<void> => this.node.lyricsManager.subscribe(this.guildId, skipSource),
        unsubscribe: (): Promise<void> => this.node.lyricsManager.unsubscribe(this.guildId),
        current: (skipSource): Promise<LyricsResult | null> => this.node.lyricsManager.current(this.guildId, skipSource),
        get: (track, skipSource): Promise<LyricsResult | null> => this.node.lyricsManager.get(track, skipSource),
    };

    /**
     *
     * The node for the player.
     * @type {NodeStructure}
     * @readonly
     * @example
     * ```ts
     * const player = manager.getPlayer("guildId");
     * const node = player.node;
     * ```
     */
    public get node(): NodeStructure {
        return (
            (typeof this.options.node === "string" ? this.manager.nodeManager.get(this.options.node) : this.options.node) ??
            this.manager.nodeManager.getLeastUsed()
        );
    }

    /**
     *
     * Search for a track or playlist.
     * @param {SearchOptions} options The options for the search.
     * @returns {Promise<QueryResult>} The search result.
     * @example
     * ```ts
     * const player = manager.getPlayer("guildId");
     * const result = await player.search({
     * 	query: "track name",
     * 	engine: SearchEngine.Youtube,
     * 	requester: {},
     * });
     *
     * console.log(result) // the search result
     * ```
     */
    public search(options: SearchOptions): Promise<QueryResult> {
        return this.manager.search({
            ...options,
            node: this.node,
        });
    }

    /**
     *
     * Play the next track in the queue.
     * @param {number} [to] The amount of tracks to skip.
     * @returns {Promise<void>}
     * @throws {PlayerError} If there are no tracks to skip.
     * @example
     * ```ts
     * const player = manager.getPlayer("guildId");
     * player.skip(2); // skip 2 tracks
     * player.skip(); // skip 1 track
     * ```
     */
    public async skip(to: number = 0): Promise<void> {
        if (!this.queue.size) {
            this.manager.emit(Events.Debug, DebugLevels.Player, "[Player] -> [Skip] No tracks to skip.");
            return;
        }

        if (typeof to === "number" && to > 0) {
            if (to > this.queue.size) throw new PlayerError("Cannot skip to a track that doesn't exist.");
            if (to < 0) throw new PlayerError("Cannot skip to a negative number.");

            this.queue.splice(0, to - 1);
        }

        if (!this.playing && !this.queue.current) return this.play();

        await this.node.stopPlayer(this.guildId);
    }

    /**
     *
     * Disconnect the player from the voice channel.
     * @returns {Promise<void>}
     * @example
     * ```ts
     * const player = manager.getPlayer("guildId");
     * player.disconnect();
     * ```
     */
    public async disconnect(): Promise<void> {
        if (!this.voiceId) return;

        await this.manager.options.sendPayload(this.guildId, {
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: null,
                self_deaf: this.selfDeaf,
                self_mute: this.selfMute,
            },
        });

        this.connected = false;
    }

    /**
     *
     * Destroy and disconnect the player.
     * @param {DestroyReasons} [reason] The reason for destroying the player.
     * @returns {Promise<void>}
     * @example
     * ```ts
     * const player = manager.getPlayer("guildId");
     * player.destroy(DestroyReasons.Stop);
     * ```
     */
    public async destroy(reason: DestroyReasons = DestroyReasons.Stop): Promise<boolean> {
        await this.disconnect();
        await this.node.destroyPlayer(this.guildId);

        this.manager.emit(Events.PlayerDestroy, this, reason);
        this.manager.emit(
            Events.Debug,
            DebugLevels.Player,
            `[Player] -> [Destroy] Destroyed player for guild: ${this.guildId} | Reason: ${reason}`,
        );

        return this.manager.deletePlayer(this.guildId);
    }

    /**
     *
     * Play a track in the player.
     * @param {Partial<PlayOptions>} [options] The options to play the track.
     * @returns {Promise<void>}
     * @throws {PlayerError} If there are no tracks to play.
     * @example
     * ```ts
     * const player = manager.getPlayer("guildId");
     *
     * player.play({
     * 	track: track,
     * 	noReplace: true,
     * });
     * ```
     */
    public async play(options: Partial<PlayOptions> = {}): Promise<void> {
        if (typeof options !== "object") throw new PlayerError("The play options must be an object.");

        if (options.track) this.queue.current = await validateTrack(this, options.track);
        else if (!this.queue.current) this.queue.current = await validateTrack(this, this.queue.shift());

        if (!this.queue.current) throw new PlayerError("No track to play.");
        if (!isTrack(this.queue.current) && !isUnresolvedTrack(this.queue.current))
            throw new PlayerError("The track must be a valid Track or UnresolvedTrack instance.");

        this.manager.emit(Events.Debug, DebugLevels.Player, `[Player] -> [Play] A new track is playing: ${this.queue.current.info.title}`);

        await this.node.updatePlayer({
            guildId: this.guildId,
            noReplace: options.noReplace,
            playerOptions: {
                ...options,
                track: {
                    userData: this.queue.current.userData,
                    encoded: this.queue.current.encoded,
                },
            },
        });
    }

    /**
     * Connect the player to the voice channel.
     * @returns {Promise<void>}
     * @example
     * ```ts
     * const player = manager.getPlayer("guildId");
     * player.connect();
     * ```
     */
    public async connect(): Promise<void> {
        if (!this.voiceId) return;

        await this.manager.options.sendPayload(this.guildId, {
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: this.voiceId,
                self_deaf: this.selfDeaf,
                self_mute: this.selfMute,
            },
        });

        this.connected = true;
    }

    /**
     *
     * Stop the player from playing.
     * @param {boolean} [destroy=true] Whether to destroy the player or not.
     * @returns {Promise<void>}
     * @example
     * ```ts
     * const player = manager.getPlayer("guildId");
     * player.stop();
     * ```
     */
    public async stop(destroy: boolean = true): Promise<void> {
        await this.node.stopPlayer(this.guildId);

        if (destroy) await this.destroy(DestroyReasons.Stop);

        this.playing = false;
        this.paused = false;
    }

    /**
     *
     * Pause or resume the player.
     * @returns {Promise<void>}
     * @example
     * ```ts
     * const player = manager.getPlayer("guildId");
     * player.setPaused();
     * ```
     */
    public async setPaused(paused: boolean = !this.paused): Promise<boolean> {
        this.manager.emit(
            Events.Debug,
            DebugLevels.Player,
            `[Player] -> [Pause] Player is now ${paused ? "paused" : "resumed"} for guild: ${this.guildId}`,
        );

        await this.node.updatePlayer({
            guildId: this.guildId,
            playerOptions: { paused },
        });

        return paused;
    }

    /**
     *
     * Set the volume of the player.
     * @param {number} volume The volume to set.
     * @returns {Promise<void>}
     * @example
     * ```ts
     * const player = manager.getPlayer("guildId");
     * player.setVolume(50); // set the volume to 50%
     * ```
     */
    public async setVolume(volume: number): Promise<void> {
        if (typeof volume !== "number" || Number.isNaN(volume) || volume < 0 || volume > 100)
            throw new PlayerError("Volume must be a number between 0 and 100.");

        await this.node.updatePlayer({
            guildId: this.guildId,
            playerOptions: { volume },
        });
    }

    /**
     *
     * Return the player as a json object.
     * @returns {PlayerJson}
     * @example
     * ```ts
     * const player = manager.getPlayer("guildId");
     * const json = player.toJSON();
     * console.log(json); // the player as a json object
     * ```
     */
    public toJSON(): PlayerJson {
        return {
            volume: this.volume,
            loop: this.loop,
            paused: this.paused,
            playing: this.playing,
            voiceId: this.voiceId,
            guildId: this.guildId,
            selfMute: this.selfMute,
            selfDeaf: this.selfDeaf,
            options: this.options,
            queue: this.queue.toJSON(),
            voice: this.voice,
        };
    }
}

/**
 * Interface representing the customizable player storage.
 */
export interface CustomizablePlayerStorage {}
