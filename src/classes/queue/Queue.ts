import { DebugLevels, Events } from "../../types/Manager";
import type { QueueJson } from "../../types/Queue";
import type { PlayerStructure } from "../../types/Structures";
import type { HoshimiTrack, Track } from "../Track";
import { QueueUtils } from "./Utils";

/**
 * Class representing a queue.
 * @class Queue
 */
export class Queue {
    /**
     * Tracks of the queue.
     * @type {HoshimiTrack[]}
     */
    public tracks: HoshimiTrack[] = [];

    /**
     * Previous tracks of the queue.
     * @type {Track[]}
     */
    public history: Track[] = [];

    /**
     * Current track of the queue.
     * @type {Track | null}
     */
    public current: Track | null = null;

    /**
     * The player instance.
     * @type {PlayerStructure}
     */
    readonly player: PlayerStructure;

    /**
     * The queue utils instance.
     * @type {QueueUtils}
     * @readonly
     */
    readonly utils: QueueUtils;

    /**
     *
     * Constructor of the queue.
     * @param {PlayerStructure} player Player instance.
     * @example
     * ```ts
     * const player = new Player();
     * const queue = new Queue(player);
     *
     * console.log(queue.size); // 0
     * queue.add(track);
     * console.log(queue.size); // 1
     * ```
     */
    constructor(player: PlayerStructure) {
        this.player = player;
        this.utils = new QueueUtils(this);
    }

    /**
     * Get the track size of the queue.
     * @type {number}
     * @returns {number} The track size of the queue.
     * @readonly
     * @example
     * ```ts
     * const queue = player.queue;
     *
     * console.log(queue.size); // 0
     * queue.add(track);
     *
     * console.log(queue.size); // 1
     * queue.add([track1, track2]);
     *
     * console.log(queue.size); // 3
     * queue.shift();
     * console.log(queue.size); // 2
     *
     * queue.clear();
     * console.log(queue.size); // 0
     * ```
     */
    public get size(): number {
        return this.tracks.length;
    }

    /**
     * Get the total track size of the queue (Includes the current track).
     * @type {number}
     * @returns {number} The total track size of the queue.
     * @readonly
     * @example
     * ```ts
     * const queue = player.queue;
     *
     * console.log(queue.totalSize); // 0
     * queue.add(track);
     *
     * console.log(queue.totalSize); // 1
     * queue.add([track1, track2]);
     *
     * console.log(queue.totalSize); // 3
     * queue.shift();
     * console.log(queue.totalSize); // 2
     *
     * queue.clear();
     * console.log(queue.totalSize); // 0
     * ```
     */
    public get totalSize(): number {
        return this.size + Number(!!this.current);
    }

    /**
     *
     * Check if the queue is empty.
     * @type {boolean}
     * @returns {boolean} True if the queue is empty.
     * @readonly
     * @example
     * ```ts
     * const queue = player.queue;
     *
     * console.log(queue.isEmpty()); // true
     * queue.add(track);
     *
     * console.log(queue.isEmpty()); // false
     * queue.clear();
     *
     * console.log(queue.isEmpty()); // true
     * ```
     */
    public isEmpty(): boolean {
        return this.size === 0;
    }

    /**
     *
     * Get the previous track of the queue.
     * @param {boolean} [remove=false] Whether to remove the track from the previous queue.
     * @returns {Track | null} The previous track of the queue.
     * @example
     * ```ts
     * const queue = player.queue;
     *
     * console.log(queue.previous()); // null
     * queue.add(track);
     * queue.add(track2);
     *
     * console.log(queue.previous()); // track
     * console.log(queue.previous(true)); // track and remove it from the previous tracks
     * ```
     */
    public previous(remove: boolean = false): Track | null {
        if (remove) return this.history.shift() ?? null;
        return this.history[0] ?? null;
    }

    /**
     *
     * Add a track or tracks to the queue.
     * @param {Track | Track[]} track The track or tracks to add.
     * @param {number} [position] The position to add the track or tracks.
     * @returns {this} The queue instance.
     * @example
     * ```ts
     * const queue = player.queue;
     *
     * console.log(queue.size); // 0
     *
     * queue.add(track);
     * console.log(queue.size); // 1
     *
     * queue.add([track1, track2]);
     * console.log(queue.size); // 3
     *
     * queue.add(track3, 1);
     * console.log(queue.size); // 4
     * console.log(queue.tracks); // [track1, track3, track2, track]
     * ```
     */
    public add(track: HoshimiTrack | HoshimiTrack[], position?: number): this {
        const tracks = Array.isArray(track) ? track : [track];

        if (typeof position === "number" && position >= 0 && position < this.tracks.length) return this.splice(position, 0, ...tracks);

        this.tracks.push(...tracks);
        this.player.manager.emit(Events.QueueUpdate, this.player, this);
        this.player.manager.emit(Events.Debug, DebugLevels.Queue, `[Queue] -> [Add] Added ${this.tracks.length} tracks to the queue.`);

        return this;
    }

    /**
     *
     * Get the first track of the queue.
     * @returns {HoshimiTrack | null} The first track of the queue.
     * @example
     * ```ts
     * const queue = player.queue;
     *
     * console.log(queue.shift()); // null
     * queue.add(track);
     *
     * console.log(queue.shift()); // track
     * queue.add(track2);
     * ```
     */
    public shift(): HoshimiTrack | null {
        return this.tracks.shift() ?? null;
    }

    /**
     *
     * Add tracks to the beginning of the queue.
     * @param {Track[]} tracks The tracks to add.
     * @returns {this} The queue instance.
     * @example
     * ```ts
     * const queue = player.queue;
     *
     * console.log(queue.size); // 0
     * queue.unshift(track);
     *
     * console.log(queue.size); // 1
     * queue.unshift([track1, track2]);
     *
     * console.log(queue.size); // 3
     * console.log(queue.tracks); // [track1, track2, track]
     * ```
     */
    public unshift(...tracks: Track[]): this {
        this.tracks.unshift(...tracks);

        this.player.manager.emit(Events.Debug, DebugLevels.Queue, `[Queue] -> [Unshift] Added ${this.tracks.length} tracks to the queue.`);

        return this;
    }

    /**
     *
     * Shuffle the queue.
     * @returns {this} The queue instance.
     * @example
     * ```ts
     * const queue = player.queue;
     *
     * console.log(queue.size); // 0
     * queue.add(track);
     * queue.add([track1, track2]);
     *
     * console.log(queue.size); // 3
     * console.log(queue.tracks); // [track, track1, track2]
     *
     * queue.shuffle();
     * console.log(queue.tracks); // [track2, track, track1]
     * ```
     */
    public shuffle(): this {
        if (this.size <= 1) return this;
        if (this.size === 2) [this.tracks[0], this.tracks[1]] = [this.tracks[1]!, this.tracks[0]!];
        else {
            for (let i = this.tracks.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.tracks[i], this.tracks[j]] = [this.tracks[j]!, this.tracks[i]!];
            }
        }

        this.player.manager.emit(Events.QueueUpdate, this.player, this);
        this.player.manager.emit(Events.Debug, DebugLevels.Queue, "[Queue] -> [Shuffle] Shuffled the queue.");

        return this;
    }

    /**
     *
     * Clear the queue.
     * @returns {this} The queue instance.
     * @example
     * ```ts
     * const queue = player.queue;
     *
     * console.log(queue.size); // 0
     * queue.add(track);
     * queue.add([track1, track2]);
     *
     * console.log(queue.size); // 3
     * queue.clear();
     * console.log(queue.size); // 0
     * ```
     */
    public clear(): this {
        this.tracks = [];
        this.history = [];

        this.current = null;

        this.player.manager.emit(Events.QueueUpdate, this.player, this);
        this.player.manager.emit(Events.Debug, DebugLevels.Queue, "[Queue] -> [Clear] Cleared the queue.");

        return this;
    }

    /**
     *
     * Move a track to a specific position in the queue.
     * @param {Track} track The track to move.
     * @param {number} to The position to move.
     * @returns {this} The queue instance.
     */
    public move(track: Track, to: number): this {
        const index = this.tracks.indexOf(track);
        if (index === -1) return this;

        this.splice(index, 1);
        this.add(track, to - 1);

        this.player.manager.emit(Events.QueueUpdate, this.player, this);
        this.player.manager.emit(Events.Debug, DebugLevels.Queue, `[Queue] -> [Move] Moved track ${track.info.title} to position ${to}.`);

        return this;
    }

    /**
     *
     * Delete tracks from the queue.
     * @param {number} start The start index.
     * @param {number} deleteCount The number of tracks to delete.
     * @param {Track | Track[]} [tracks] The tracks to add.
     * @returns {this} The queue instance.
     */
    public splice(start: number, deleteCount: number, tracks?: HoshimiTrack | HoshimiTrack[]): this {
        if (!this.size && tracks) this.add(tracks);

        if (tracks) this.tracks.splice(start, deleteCount, ...(Array.isArray(tracks) ? tracks : [tracks]));
        else this.tracks.splice(start, deleteCount);

        this.player.manager.emit(Events.QueueUpdate, this.player, this);
        this.player.manager.emit(Events.Debug, DebugLevels.Queue, `[Queue] -> [Splice] Removed ${deleteCount} tracks from the queue.`);

        return this;
    }

    /**
     *
     * Convert the queue to a JSON object.
     * @returns {QueueJson} The queue JSON object.
     */
    public toJSON(): QueueJson {
        const max = this.player.manager.options.queueOptions.maxPreviousTracks;

        if (this.history.length > max) this.history.splice(max, this.history.length);

        return {
            tracks: this.tracks,
            history: this.history,
            current: this.current,
        };
    }
}
