import { DebugLevels, Events } from "../../types/Manager";
import type { QueueJson } from "../../types/Queue";
import type { Player } from "../Player";
import type { Track } from "../Track";

/**
 * Class representing a queue.
 */
export class Queue {
	/**
	 * Tracks of the queue.
	 * @type {Track[]}
	 */
	public tracks: Track[] = [];

	/**
	 * Previous tracks of the queue.
	 * @type {Track[]}
	 */
	public previous: Track[] = [];

	/**
	 * Current track of the queue.
	 * @type {Track | null}
	 */
	public current: Track | null = null;

	/**
	 * The player instance.
	 * @type {Player}
	 */
	readonly player: Player;

	/**
	 *
	 * Constructor of the queue.
	 * @param {Player}  player Player instance.
	 */
	constructor(player: Player) {
		this.player = player;
	}

	/**
	 * Get the track size of the queue.
	 * @type {number}
	 * @returns {number} The track size of the queue.
	 */
	public get size(): number {
		return this.tracks.length;
	}

	/**
	 * Get the total track size of the queue (Includes the current track).
	 * @type {number}
	 * @returns {number} The total track size of the queue.
	 */
	public get totalSize(): number {
		return this.size + Number(!!this.current);
	}

	/**
	 *
	 * Check if the queue is empty.
	 * @type {boolean}
	 * @returns {boolean} True if the queue is empty.
	 */
	public isEmpty(): boolean {
		return this.size === 0;
	}

	/**
	 *
	 * Get the previous track of the queue.
	 * @param {boolean} [remove=false] Whether to remove the track from the previous queue.
	 * @returns {Track | null} The previous track of the queue.
	 */
	public getPrevious(remove?: boolean): Track | null {
		if (remove) return this.previous.shift() ?? null;
		return this.previous[0] ?? null;
	}

	/**
	 *
	 * Add a track or tracks to the queue.
	 * @param {Track | Track[]} track The track or tracks to add.
	 * @param {number} [position] The position to add the track or tracks.
	 * @returns {this} The queue instance.
	 */
	public add(track: Track | Track[], position?: number): this {
		if (typeof position === "number" && position >= 0 && position < this.tracks.length) {
			this.tracks.splice(position, 0, ...(Array.isArray(track) ? track : [track]));
			return this;
		}

		if (Array.isArray(track)) this.tracks.push(...track);
		else this.tracks.push(track);

		this.player.manager.emit(
			Events.Debug,
			DebugLevels.Queue,
			`[Queue] -> [Add] Added ${this.tracks.length} tracks to the queue.`,
		);

		return this;
	}

	/**
	 *
	 * Get the first track of the queue.
	 * @returns {Track | null} The first track of the queue.
	 */
	public shift(): Track | null {
		return this.tracks.shift() ?? null;
	}

	/**
	 *
	 * Add tracks to the beginning of the queue.
	 * @param {Track[]} tracks The tracks to add.
	 * @returns {this} The queue instance.
	 */
	public unshift(...tracks: Track[]): this {
		this.tracks.unshift(...tracks);

		this.player.manager.emit(
			Events.Debug,
			DebugLevels.Queue,
			`[Queue] -> [Unshift] Added ${this.tracks.length} tracks to the queue.`,
		);

		return this;
	}

	/**
	 *
	 * Shuffle the queue.
	 * @returns {Promise<this>} The queue instance.
	 */
	public async shuffle(): Promise<this> {
		if (this.size <= 1) return this;
		if (this.size === 2) [this.tracks[0], this.tracks[1]] = [this.tracks[1]!, this.tracks[0]!];
		else {
			for (let i = this.tracks.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[this.tracks[i], this.tracks[j]] = [this.tracks[j]!, this.tracks[i]!];
			}
		}

		this.player.manager.emit(Events.QueueUpdate, this.player, this);
		this.player.manager.emit(
			Events.Debug,
			DebugLevels.Queue,
			"[Queue] -> [Shuffle] Shuffled the queue.",
		);

		return this;
	}

	/**
	 *
	 * Clear the queue.
	 * @returns {this} The queue instance.
	 */
	public clear(): this {
		this.tracks = [];
		this.previous = [];
		this.current = null;

		this.player.manager.emit(Events.QueueUpdate, this.player, this);
		this.player.manager.emit(
			Events.Debug,
			DebugLevels.Queue,
			"[Queue] -> [Clear] Cleared the queue.",
		);

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

		this.tracks.splice(index, 1);
		this.add(track, to - 1);

		this.player.manager.emit(Events.QueueUpdate, this.player, this);
		this.player.manager.emit(
			Events.Debug,
			DebugLevels.Queue,
			`[Queue] -> [Move] Moved track ${track.info.title} to position ${to}.`,
		);

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
	public splice(start: number, deleteCount: number, tracks?: Track | Track[]): this {
		if (!this.size && tracks) this.add(tracks);

		if (tracks)
			this.tracks.splice(start, deleteCount, ...(Array.isArray(tracks) ? tracks : [tracks]));
		else this.tracks.splice(start, deleteCount);

		this.player.manager.emit(Events.QueueUpdate, this.player, this);
		this.player.manager.emit(
			Events.Debug,
			DebugLevels.Queue,
			`[Queue] -> [Splice] Removed ${deleteCount} tracks from the queue.`,
		);

		return this;
	}

	/**
	 *
	 * Convert the queue to a JSON object.
	 * @returns {QueueJson} The queue JSON object.
	 */
	public toJSON(): QueueJson {
		if (this.previous.length > this.player.manager.options.queueOptions.maxPreviousTracks!)
			this.previous.splice(
				this.player.manager.options.queueOptions.maxPreviousTracks!,
				this.previous.length,
			);

		return {
			tracks: this.tracks,
			previous: this.previous,
			current: this.current,
		};
	}
}
