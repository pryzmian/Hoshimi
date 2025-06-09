import { DebugLevels, Events, type Awaitable } from "../../types/Manager";
import type { Queue } from "./Queue";

import { StorageError } from "../Errors";
import { QueueStore } from "./Store";

import { isTrack } from "../../util/functions/utils";
import type { HoshimiQueueOptions } from "../../types/Queue";

/**
 * Class representing the queue utils.
 * @class QueueUtils
 */
export class QueueUtils {
	/**
	 * Player instance.
	 * @type {Queue}
	 * @private
	 * @readonly
	 * @internal
	 */
	private readonly queue: Queue;

	/**
	 * Queue store.
	 * @type {QueueStore}
	 * @private
	 * @readonly
	 * @internal
	 */
	private readonly store: QueueStore;

	/**
	 * Options for the queue.
	 * @type {HoshimiQueueOptions}
	 * @private
	 * @readonly
	 * @internal
	 */
	private readonly options: Required<HoshimiQueueOptions>;

	/**
	 *
	 * Constructor of the queue utils.
	 * @param queue Player instance.
	 */
	constructor(queue: Queue) {
		this.queue = queue;
		this.options = queue.player.manager.options.queueOptions;
		this.store = new QueueStore(this.options.storage);
	}

	/**
	 *
	 * Save the queue.
	 * @returns {Awaitable<void>}
	 * @example
	 * ```ts
	 * await player.queue.utils.save();
	 * ```
	 */
	public save(): Awaitable<void> {
		const max = this.options.maxPreviousTracks;
		const length = this.queue.tracks.length;
		const json = this.queue.toJSON();

		if (length > max) this.queue.history.splice(0, length - max);

		this.queue.player.manager.emit(
			Events.Debug,
			DebugLevels.Queue,
			`[Queue] -> [Adapter] Saving queue for ${this.queue.player.guildId} | Object: ${JSON.stringify(json)}`,
		);

		return this.store.set(this.queue.player.guildId, json);
	}

	/**
	 *
	 * Destroy the queue.
	 * @returns {Promise<void>}
	 * @example
	 * ```ts
	 * await player.queue.utils.destroy();
	 * ```
	 */
	public destroy(): Awaitable<boolean> {
		this.queue.player.manager.emit(
			Events.Debug,
			DebugLevels.Queue,
			`[Queue] -> [Adapter] Destroying queue for ${this.queue.player.guildId}`,
		);

		return this.store.delete(this.queue.player.guildId);
	}

	/**
	 *
	 * Sync the queue.
	 * @returns {Awaitable<void>}
	 * @example
	 * ```ts
	 * await player.queue.utils.sync();
	 * ```
	 */
	public async sync(override = true, syncCurrent = false): Promise<void> {
		const data = await this.store.get(this.queue.player.guildId);
		if (!data)
			throw new StorageError(
				`No data found to sync for guildId: ${this.queue.player.guildId}`,
			);

		if (syncCurrent && data.current && !this.queue.current && isTrack(data.current))
			this.queue.current = data.current;

		const tracks = data.tracks.filter((track) => isTrack(track)) || [];
		const history = data.history.filter((track) => isTrack(track)) || [];

		if (tracks.length)
			this.queue.tracks.splice(
				override ? 0 : this.queue.tracks.length,
				override ? this.queue.tracks.length : 0,
				...tracks,
			);

		if (history.length)
			this.queue.history.splice(0, override ? this.queue.tracks.length : 0, ...history);

		this.queue.player.manager.emit(
			Events.Debug,
			DebugLevels.Queue,
			`[Queue] -> [Adapter] Syncing queue for ${this.queue.player.guildId} | Object: ${JSON.stringify(data)}`,
		);

		await this.save();
	}
}
