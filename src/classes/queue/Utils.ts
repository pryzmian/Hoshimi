import { DebugLevels, Events, type Awaitable } from "../../types/Manager";
import type { Queue } from "./Queue";

import { StorageError } from "../Errors";
import { QueueStore } from "./Store";

import { isTrack } from "../../util/functions/validations";

/**
 * Class representing the queue utils.
 * @class QueueUtils
 */
export class QueueUtils {
	/**
	 * Player instance.
	 */
	private queue: Queue;
	/**
	 * Queue store.
	 */
	private store: QueueStore;

	/**
	 *
	 * Constructor of the queue utils.
	 * @param queue Player instance.
	 */
	constructor(queue: Queue) {
		this.queue = queue;
		this.store = new QueueStore(this.queue.player.manager.options.queueOptions.storage);
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
		const max = this.queue.player.manager.options.queueOptions.maxPreviousTracks;
		const length = this.queue.player.queue.tracks.length;
		const json = this.queue.player.queue.toJSON();

		if (length > max) this.queue.history.splice(max, length);

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

		if (syncCurrent && !this.queue.player.queue.current)
			this.queue.player.queue.current = data.current;
		if (
			Array.isArray(data.tracks) &&
			data.tracks.length &&
			data.tracks.some((track) => isTrack(track))
		)
			this.queue.player.queue.tracks.splice(
				override ? 0 : this.queue.player.queue.tracks.length,
				override ? this.queue.player.queue.tracks.length : 0,
				...data.tracks.filter((track) => isTrack(track)),
			);
		if (
			Array.isArray(data.history) &&
			data.history.length &&
			data.history.some((track) => isTrack(track))
		)
			this.queue.player.queue.history.splice(
				0,
				override ? this.queue.player.queue.tracks.length : 0,
				...data.history.filter((track) => isTrack(track)),
			);

		this.queue.player.manager.emit(
			Events.Debug,
			DebugLevels.Queue,
			`[Queue] -> [Adapter] Syncing queue for ${this.queue.player.guildId} | Object: ${JSON.stringify(data)}`,
		);

		await this.save();
	}
}
