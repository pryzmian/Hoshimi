import type { StorageAdapter } from "../classes/queue/adapters/Adapter";
import type { HoshimiTrack, Track } from "../classes/Track";
import type { Awaitable } from "./Manager";
import type { PlayerStructure } from "./Structures";

/**
 * The queue options.
 */
export interface HoshimiQueueOptions {
    /**
     * The maximum amount of tracks that can be saved in the queue.
     * @type {number}
     * @default 25
     */
    maxHistory?: number;
    /**
     *
     * The function to use for autoplay.
     * @param {Player} player The player.
     * @param {HoshimiTrack | null} lastTrack The last track played.
     */
    autoplayFn?(player: PlayerStructure, lastTrack: HoshimiTrack | null): Awaitable<void>;
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
     * @type {HoshimiTrack[]}
     */
    tracks: HoshimiTrack[];
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
