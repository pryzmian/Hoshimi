import type { IncomingMessage } from "node:http";
import type { Node } from "../../classes/node/Node";
import { type LavalinkPayload, State, OpCodes } from "../../types/Node";
import { DebugLevels, Events } from "../../types/Manager";
import { PlayerEventType } from "../../types/Player";
import { playerUpdate, trackEnd, trackStart } from "./player";

/**
 *
 * Emitted when the socket connection is opened.
 * @param this The node that emitted the event.
 */
export function onOpen(this: Node, res: IncomingMessage): void {
	const isResume = res.headers["session-resumed"] === "true";
	const apiVersion = res.headers["lavalink-api-version"];

	this.manager.emit(
		Events.Debug,
		DebugLevels.Node,
		`[Socket] -> [${this.id}]: Connection handshake complete with ${this.address}. | API Version: ${apiVersion} | Resumed: ${isResume}`,
	);
}

/**
 *
 * Emitted when the socket connection is closed.
 * @param this The node that emitted the event.
 * @param code The close code of the connection.
 * @param reason The close reason message.
 */
export function onClose(this: Node, code: number, reason: string): void {
	this.manager.emit(
		Events.Debug,
		DebugLevels.Node,
		`[Socket] -> [${this.id}]: Connection closed with ${this.address}. | Code: ${code} | Reason: ${reason}`,
	);
}

/**
 *
 * Emitted when an error occurs.
 * @param this The node that emitted the event.
 * @param error The error that occurred.
 */
export function onError(this: Node, error?: Error): void {
	if (!error) return;

	if (this.reconnectTimeout) {
		clearInterval(this.reconnectTimeout);
		this.reconnectTimeout = null;
	}

	this.manager.emit(
		Events.Debug,
		DebugLevels.Node,
		`[Socket] -> [${this.id}]: Connection error with ${this.address}. | Error: ${error.message}`,
	);
	this.manager.emit(Events.NodeError, this, error);
}

/**
 *
 * Emitted when a message is received from the socket.
 * @param this The node that emitted the event.
 * @param message The message received from the socket.
 */
export function onMessage(this: Node, message: Buffer | string) {
	if (Array.isArray(message)) message = Buffer.concat(message);
	else if (message instanceof ArrayBuffer) message = Buffer.from(message);

	try {
		const payload: LavalinkPayload = JSON.parse(message.toString());
		if (!payload.op) return;

		this.manager.emit(Events.NodeRaw, this, payload);

		switch (payload.op) {
			case OpCodes.Stats:
				{
					this.stats = payload;
					this.manager.emit(
						Events.Debug,
						DebugLevels.Node,
						`[Socket] <- [${this.id}]: Received stats. | System load: ${this.penalties}`,
					);
				}
				break;

			case OpCodes.Ready:
				{
					if (!payload.sessionId) {
						this.manager.emit(
							Events.Debug,
							DebugLevels.Node,
							`[Socket] -> [${this.id}]: Session id was not provided. Breaking up the connection.`,
						);
						return;
					}

					this.state = State.Connected;
					this.sessionId = payload.sessionId;
					this.session.resuming = payload.resumed;

					this.manager.emit(
						Events.Debug,
						DebugLevels.Node,
						`[Socket] <- [${this.id}]: Received ready event. | Session id: ${payload.sessionId} | Resumed: ${payload.resumed}`,
					);
					this.manager.emit(Events.NodeReady, this, payload);
				}
				break;

			case OpCodes.Event: {
				const player = this.manager.getPlayer(payload.guildId);
				if (!player) return;

				switch (payload.type) {
					case PlayerEventType.TrackEnd:
						return trackEnd.call(player, payload);

					case PlayerEventType.TrackStart:
						return trackStart.call(player, payload);
				}

				break;
			}

			case OpCodes.PlayerUpdate: {
				return playerUpdate.call(this, payload);
			}
		}

		this.manager.emit(
			Events.Debug,
			DebugLevels.Node,
			`[Socket] -> [${this.id}]: Received payload: ${JSON.stringify(payload)}`,
		);
	} catch (error) {
		this.manager.emit(Events.NodeError, this, error);
	}
}
