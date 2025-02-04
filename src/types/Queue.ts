import type { Player } from "../classes/Player";
import type { Track } from "../classes/Track";
import type { Awaitable } from "./Manager";

/**
 * The queue options.
 */
export interface HoshimiQueueOptions {
	/**
	 * The maximum amount of tracks that can be in the queue.
	 * @type {number}
	 * @default 25
	 */
	maxPreviousTracks?: number;
	/**
	 *
	 * The function to use for autoplay.
	 * @param player The player.
	 * @param track The last track played.
	 */
	autoplayFn?(player: Player, lastTrack: Track | null): Awaitable<void>;
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
	previous: Track[];
	/**
	 * The current track of the queue.
	 * @type {Track | null}
	 */
	current: Track | null;
}
