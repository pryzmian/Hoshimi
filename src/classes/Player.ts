import {
	DebugLevels,
	DestroyReasons,
	Events,
	type Nullable,
	type SearchOptions,
	type SearchResult,
} from "../types/Manager";
import type { LyricsResult } from "../types/Node";
import {
	type LavalinkPlayerVoice,
	LoopMode,
	type LyricsMethods,
	type PlayOptions,
	type PlayerJson,
	type PlayerOptions,
} from "../types/Player";
import {
	isTrack,
	isUnresolvedTrack,
	validateTrack,
	validatePlayerOptions,
} from "../util/functions/utils";
import { PlayerError } from "./Errors";
import type { Hoshimi } from "./Hoshimi";
import type { Node } from "./node/Node";
import { Queue } from "./queue/Queue";

/**
 * Class representing a Hoshimi player.
 * @class Player
 */
export class Player {
	/**
	 * The data for the player.
	 * @type {Record<string, unknown>}
	 * @readonly
	 * @private
	 */
	private readonly data: Map<StorageKeys, StorageValues> = new Map<StorageKeys, StorageValues>();

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
	readonly queue: Queue;

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

		this.queue = new Queue(this);
	}

	/**
	 * The lyrics methods for the player.
	 * @type {LyricsMethods}
	 * @readonly
	 */
	readonly lyrics: LyricsMethods = {
		subscribe: (skipSource): Promise<void> =>
			this.node.lyricsManager.subscribe(this.guildId, skipSource),
		unsubscribe: (): Promise<void> => this.node.lyricsManager.unsubscribe(this.guildId),
		current: (skipSource): Promise<LyricsResult | null> =>
			this.node.lyricsManager.current(this.guildId, skipSource),
		get: (track, skipSource): Promise<LyricsResult | null> =>
			this.node.lyricsManager.get(track, skipSource),
	};

	/**
	 *
	 * The node for the player.
	 * @type {Node}
	 * @readonly
	 * @example
	 * ```ts
	 * const player = manager.getPlayer("guildId");
	 * const node = player.node;
	 * ```
	 */
	public get node(): Node {
		return (
			(typeof this.options.node === "string"
				? this.manager.nodeManager.get(this.options.node)
				: this.options.node) ?? this.manager.nodeManager.getLeastUsed()
		);
	}

	/**
	 *
	 * Set the data for the player.
	 * @param {K} key The key to set the data to.
	 * @param {V} value The value to set the data to.
	 * @returns {this} The player.
	 * @example
	 * ```ts
	 * const player = manager.getPlayer("guildId");
	 * player.set("key", "value")
	 * player.set("key2", "value2");
	 * ```
	 */
	public set<K extends StorageKeys = StorageKeys, V extends StorageValues<K> = StorageValues<K>>(
		key: K,
		value: V,
	): this {
		this.data.set(key, value);
		return this;
	}

	/**
	 *
	 * Get the data from the player.
	 * @param {K} key The key to get the data from.
	 * @returns {V | undefined} The data from the player.
	 * @example
	 * ```ts
	 * const player = manager.getPlayer("guildId");
	 * player.get("key"); // "value"
	 * player.get("key2"); // undefined
	 * ```
	 */
	public get<K extends StorageKeys = StorageKeys, V extends StorageValues<K> = StorageValues<K>>(
		key: K,
	): V | undefined {
		return this.data.get(key) as V | undefined;
	}

	/**
	 *
	 * Delete the data from the player.
	 * @param {K} key The key to delete the data from.
	 * @returns {boolean} If the data was deleted.
	 * @example
	 * ```ts
	 * const player = manager.getPlayer("guildId");
	 * player.delete("key"); // true
	 * player.delete("key2"); // false
	 * ```
	 */
	public delete<K extends StorageKeys = StorageKeys>(key: K): boolean {
		return this.data.delete(key);
	}

	/**
	 *
	 * Check if the data exists in the player.
	 * @param {K} key The key to get the data from.
	 * @returns {V | undefined} The data from the player.
	 * @example
	 * ```ts
	 * const player = manager.getPlayer("guildId");
	 * player.has("key"); // true
	 * player.has("key2"); // false
	 * ```
	 */
	public has<K extends StorageKeys = StorageKeys>(key: K): boolean {
		return this.data.has(key);
	}

	/**
	 *
	 * Get the data from the player.
	 * @returns {MapIterator<StorageValues>} The data from the player.
	 * @example
	 * ```ts
	 * const player = manager.getPlayer("guildId");
	 * player.values<"key1" | "key2">(); // the player data values from the player
	 * ```
	 */
	public values<
		K extends StorageKeys = StorageKeys,
		V extends StorageValues<K> = StorageValues<K>,
	>(): MapIterator<V> {
		return this.data.values() as MapIterator<V>;
	}

	/**
	 *
	 * Get the keys from the player.
	 * @returns {MapIterator<StorageKeys>} The keys from the player.
	 * @example
	 * ```ts
	 * const player = manager.getPlayer("guildId");
	 * player.keys<"key1" | "key2">(); // the player data keys from the player
	 * ```
	 */
	public keys<K extends StorageKeys = StorageKeys>(): MapIterator<K> {
		return this.data.keys() as MapIterator<K>;
	}

	/**
	 *
	 * Get the data from the player.
	 * @returns {Map<StorageKeys, StorageValues>} The data from the player.
	 * @example
	 * ```ts
	 * const player = manager.getPlayer("guildId");
	 * player.entries<"key1" | "key2">(); // the player data entries from the player
	 * ```
	 */
	public entries<
		K extends StorageKeys = StorageKeys,
		V extends StorageValues<K> = StorageValues<K>,
	>(): MapIterator<[K, V]> {
		return this.data.entries() as MapIterator<[K, V]>;
	}

	/**
	 *
	 * Search for a track or playlist.
	 * @param {SearchOptions} options The options for the search.
	 * @returns {Promise<SearchResult>} The search result.
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
	public search(options: SearchOptions): Promise<SearchResult> {
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
			this.manager.emit(
				Events.Debug,
				DebugLevels.Player,
				"[Player] -> [Skip] No tracks to skip.",
			);

			return;
		}

		if (typeof to === "number" && to > 0) {
			if (to > this.queue.size)
				throw new PlayerError("Cannot skip to a track that doesn't exist.");

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
		if (typeof options !== "object")
			throw new PlayerError("The play options must be an object.");

		try {
			if (options.track) this.queue.current = await validateTrack(this, options.track);
			else if (!this.queue.current)
				this.queue.current = await validateTrack(this, this.queue.shift());
		} catch {}

		if (!this.queue.current) throw new PlayerError("No track to play.");
		if (!isTrack(this.queue.current) && !isUnresolvedTrack(this.queue.current))
			throw new PlayerError("The track must be a valid Track or UnresolvedTrack instance.");

		this.manager.emit(
			Events.Debug,
			DebugLevels.Player,
			`[Player] -> [Play] A new track is playing: ${this.queue.current.info.title}`,
		);

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

/**
 * Type representing the customizable player storage.
 */
type StorageKeys = keyof CustomizablePlayerStorage | (string & {});

/**
 * Type representing the customizable player storage values.
 */
type StorageValues<V extends StorageKeys = StorageKeys> = V extends keyof CustomizablePlayerStorage
	? CustomizablePlayerStorage[V]
	: unknown;
