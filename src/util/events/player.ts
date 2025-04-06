import type { Node } from "../../classes/node/Node";
import type { Player } from "../../classes/Player";
import type { Track } from "../../classes/Track";
import { DebugLevels, Events } from "../../types/Manager";
import {
	LoopMode,
	type TrackStartEvent,
	type TrackEndEvent,
	type TrackStuckEvent,
	type TrackExceptionEvent,
	PlayerEventType,
	type PlayerUpdate,
	TrackEndReason,
} from "../../types/Player";

/**
 *
 * Queue the track end event.
 * @param {this} this The player that emitted the event.
 * @returns {Promise<void>} The promise, nothing new.
 */
async function queueTrackEnd(this: Player): Promise<void> {
	if (
		this.queue.current &&
		!this.queue.previous.find(
			(x) =>
				x.info.identifier === this.queue.current?.info.identifier &&
				x.info.title === this.queue.current?.info.title,
		)
	) {
		this.queue.previous.unshift(this.queue.current);
		if (this.queue.previous.length > this.manager.options.queueOptions.maxPreviousTracks!)
			this.queue.previous.splice(
				this.manager.options.queueOptions.maxPreviousTracks!,
				this.queue.previous.length,
			);

		//await this.queue.utils.save();

		this.manager.emit(
			Events.Debug,
			DebugLevels.Player,
			`[Player] -> [Previous] The track: ${this.queue.current?.info.title} has been added to the previous track list.`,
		);
	}

	if (this.loop === LoopMode.Track && this.queue.current) this.queue.unshift(this.queue.current);
	if (this.loop === LoopMode.Queue && this.queue.current) this.queue.add(this.queue.current);

	if (!this.queue.current) this.queue.current = this.queue.shift();

	//await this.queue.utils.save();

	return;
}

/**
 *
 * Emitted when the queue ends.
 * @param {this} this The player that emitted the event.
 * @param {Track | null} track The track that ended.
 * @param {TrackEndEvent | TrackStuckEvent | TrackExceptionEvent} payload The payload of the event.
 * @returns {Promise<void>} The promise, nothing new here either.
 */
async function queueEnd(
	this: Player,
	track: Track | null,
	payload: TrackEndEvent | TrackStuckEvent | TrackExceptionEvent,
): Promise<void> {
	this.playing = false;
	this.paused = false;
	this.queue.current = null;

	if (typeof this.manager.options.queueOptions.autoplayFn === "function") {
		await this.manager.options.queueOptions.autoplayFn(this, this.queue.current ?? track);
		if (this.queue.size > 0) await queueTrackEnd.call(this);
		if (this.queue.current) {
			if (payload.type === PlayerEventType.TrackEnd)
				this.manager.emit(Events.TrackEnd, this, track, payload);

			this.manager.emit(
				Events.Debug,
				DebugLevels.Player,
				"[Queue] -> [Autoplay] Track(s) queued from autoplay function.",
			);

			return this.play({ noReplace: true, paused: false });
		}
	}

	//if (track) await this.queue.utils.save();
	//if ((payload as TrackEndEvent).reason !== "stopped") await this.queue.utils.save();

	this.manager.emit(Events.QueueEnd, this, this.queue);
	this.manager.emit(Events.Debug, DebugLevels.Player, "[Player] -> [Queue] The queue has ended.");
}

/**
 *
 * Emitted when a track starts playing.
 * @param {this} this The player that emitted the event.
 * @param {TrackStartEvent} payload The payload of the event.
 * @returns {Promise<void>} The promise, nothing new... again.
 */
export async function trackStart(this: Player, payload: TrackStartEvent): Promise<void> {
	this.paused = false;
	this.playing = true;

	//if (this.queue.current) await this.queue.utils.save();

	this.manager.emit(Events.TrackStart, this, this.queue.current, payload);
	this.manager.emit(
		Events.Debug,
		DebugLevels.Player,
		`[Player -> Start] The track: ${this.queue.current?.info.title ?? "Unknown"} has started playing.`,
	);
}

/**
 *
 * Emitted when a track ends.
 * @param {this} this The player that emitted the event.
 * @param {TrackEndEvent} payload The payload of the event.
 * @returns {Promise<void>} The promise, nothing new... again and again.
 */
export async function trackEnd(this: Player, payload: TrackEndEvent): Promise<void> {
	const current = this.queue.current;

	if (!this.queue.size && this.loop === LoopMode.Off)
		return queueEnd.call(this, current, payload);

	switch (payload.reason) {
		case TrackEndReason.Replaced: {
			this.manager.emit(Events.TrackEnd, this, current, payload);
			return;
		}

		case TrackEndReason.LoadFailed:
		case TrackEndReason.Cleanup: {
			this.playing = false;

			await queueTrackEnd.call(this);

			if (!this.queue.size || !this.queue.current)
				return queueEnd.call(this, current, payload);

			this.manager.emit(Events.TrackEnd, this, current, payload);
			this.manager.emit(
				Events.Debug,
				DebugLevels.Player,
				`[Player] -> ÑEnd] The track: ${current?.info.title ?? "Unknown"} has ended.`,
			);

			this.queue.current = null;

			return this.play();
		}
	}

	//if (current) await this.queue.utils.save();

	await queueTrackEnd.call(this);

	this.queue.current = null;

	if (!this.queue.size) {
		this.playing = false;
		return queueEnd.call(this, current, payload);
	}

	this.manager.emit(Events.TrackEnd, this, current, payload);
	this.manager.emit(
		Events.Debug,
		DebugLevels.Player,
		`[Player] -> [End] The track: ${current?.info.title ?? "Uhknown"} has ended.`,
	);

	return this.play();
}

/**
 *
 * @param {this} this The node that emitted the event.
 * @param {PlayerUpdate} payload The payload of the event.
 * @returns {Promise<void>} Yeah, i don't know what to say here.
 */
export async function playerUpdate(this: Node, payload: PlayerUpdate): Promise<void> {
	const player = this.manager.getPlayer(payload.guildId);
	if (!player) return;

	const oldPlayer = player.toJSON();

	player.ping = payload.state.ping;
	player.connected = payload.state.connected;
	player.createdTimestamp = payload.state.time;
	player.position = payload.state.position;

	this.manager.emit(
		Events.Debug,
		DebugLevels.Node,
		`[Player] -> [Update] Player updated: ${player.guildId} | Object: ${JSON.stringify(payload)}`,
	);
	this.manager.emit(Events.PlayerUpdate, player, oldPlayer, payload);
}
