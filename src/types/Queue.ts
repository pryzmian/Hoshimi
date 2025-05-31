import type { Player } from "../classes/Player";
import type { StorageAdapter } from "../classes/queue/adapters/abstract";
import type { Track } from "../classes/Track";
import type { Awaitable } from "./Manager";

/**
 * The queue options.
 */
export interface HoshimiQueueOptions {
	/**
	 * The maximum amount of tracks that can be saved in the queue.
	 * @type {number}
	 * @default 25
	 */
	maxPreviousTracks?: number;
	/**
	 *
	 * The function to use for autoplay.
	 * @param {Player} player The player.
	 * @param {Track | null} lastTrack The last track played.
	 */
	autoplayFn?(player: Player, lastTrack: Track | null): Awaitable<void>;
	/**
	 * Enable the auto play for the queue. (By default, only supports `youtube` and `spotify`, add more with your own function)
	 * @type {boolean}
	 * @default false
	 */
	autoPlay?: boolean;
	/**
	 * The storage manager to use for the queue.
	 * @type {StorageAdapter}
	 * @default {MemoryAdapter}
	 */
	storage?: StorageAdapter;
}

/**
 * The queue json.
 */
export interface QueueJson {
	/**
	 * The tracks of the queue.
	 * @type {Track[]}
	 */
	tracks: Track[];
	/**
	 * The previous tracks of the queue.
	 * @type {Track[]}
	 */
	history: Track[];
	/**
	 * The current track of the queue.
	 * @type {Track | null}
	 */
	current: Track | null;
}
