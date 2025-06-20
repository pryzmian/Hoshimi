import type { IncomingMessage } from "node:http";
import type { Node } from "../../classes/node/Node";
import {
	type LavalinkPayload,
	State,
	OpCodes,
	type NodeInfo,
	WebsocketCloseCodes,
	NodeDestroyReasons,
} from "../../types/Node";
import { DebugLevels, Events } from "../../types/Manager";
import { PlayerEventType } from "../../types/Player";
import {
	lyricsFound,
	lyricsLine,
	lyricsNotFound,
	playerUpdate,
	socketClosed,
	trackEnd,
	trackError,
	trackStart,
	trackStuck,
} from "./player";

/**
 *
 * Emitted when the socket connection is opened.
 * @param {Node} this The node that emitted the event.
 * @param {IncomingMessage} res The response from the socket connection.
 * @returns {void} Nothing new.
 */
export function onOpen(this: Node, res: IncomingMessage): void {
	const isResume = res.headers["session-resumed"] === "true";
	const apiVersion = res.headers["lavalink-api-version"] ?? "unknown";

	this.retryAmount = this.options.retryAmount;

	this.nodeManager.manager.emit(
		Events.Debug,
		DebugLevels.Node,
		`[Socket] -> [${this.id}]: Connection handshake complete with ${this.address}. | API Version: ${apiVersion} | Resumed: ${isResume}`,
	);
}

/**
 *
 * Emitted when the socket connection is closed.
 * @param {Node} this The node that emitted the event.
 * @param {number} code The close code of the connection.
 * @param {string} reason The close reason message.
 * @returns {void} The same thing as above.
 */
export function onClose(this: Node, code: number, reason: string): void {
	this.nodeManager.manager.emit(
		Events.Debug,
		DebugLevels.Node,
		`[Socket] -> [${this.id}]: Connection closed with ${this.address}. | Code: ${code} | Reason: ${reason}`,
	);

	this.nodeManager.manager.emit(Events.NodeDisconnect, this);

	if (code !== WebsocketCloseCodes.NormalClosure || reason !== NodeDestroyReasons.Destroy) {
		if (this.nodeManager.nodes.has(this.id)) this.reconnect();
	}
}

/**
 *
 * Emitted when an error occurs.
 * @param {Node} this The node that emitted the event.
 * @param {Error} [error] The error that occurred.
 * @returns {void} Did you know that void is a type in TypeScript?
 */
export function onError(this: Node, error?: Error): void {
	if (!error) return;

	if (this.reconnectTimeout) {
		clearInterval(this.reconnectTimeout);
		this.reconnectTimeout = null;
	}

	this.nodeManager.manager.emit(
		Events.Debug,
		DebugLevels.Node,
		`[Socket] -> [${this.id}]: Connection error with ${this.address}. | Error: ${error.message}`,
	);
	this.nodeManager.manager.emit(Events.NodeError, this, error);
}

/**
 *
 * Emitted when a message is received from the socket.
 * @param {Node} this The node that emitted the event.
 * @param {Buffer | string} message The message received from the socket.
 * @returns {Promise<void>} I'm running out of ideas for this.
 */
export async function onMessage(this: Node, message: Buffer | string): Promise<void> {
	if (Array.isArray(message)) message = Buffer.concat(message);
	else if (message instanceof ArrayBuffer) message = Buffer.from(message);

	try {
		const payload: LavalinkPayload = JSON.parse(message.toString());
		if (!payload.op) return;

		this.nodeManager.manager.emit(Events.NodeRaw, this, payload);

		switch (payload.op) {
			case OpCodes.Stats:
				{
					this.stats = payload;
					this.nodeManager.manager.emit(
						Events.Debug,
						DebugLevels.Node,
						`[Socket] <- [${this.id}]: Received stats. | System load: ${this.penalties}`,
					);
				}
				break;

			case OpCodes.Ready:
				{
					if (!payload.sessionId) {
						this.nodeManager.manager.emit(
							Events.Debug,
							DebugLevels.Node,
							`[Socket] -> [${this.id}]: Session id was not provided. Breaking up the connection...`,
						);

						this.nodeManager.manager.emit(Events.NodeDestroy, this, {
							code: WebsocketCloseCodes.AbnormalClosure,
							reason: NodeDestroyReasons.MissingSession,
						});

						return this.disconnect();
					}

					this.state = State.Connected;
					this.sessionId = payload.sessionId;
					this.session.resuming = payload.resumed;

					this.info = await this.rest.request<NodeInfo>({ endpoint: "/info" });

					this.nodeManager.manager.emit(
						Events.Debug,
						DebugLevels.Node,
						`[Socket] <- [${this.id}]: Received ready event. | Session id: ${payload.sessionId} | Resumed: ${payload.resumed}`,
					);
					this.nodeManager.manager.emit(Events.NodeReady, this, payload);

					const isResumable = this.nodeManager.manager.options.nodeOptions.resumable;
					if (isResumable) {
						const timeout = this.nodeManager.manager.options.nodeOptions.resumeTimeout;

						this.nodeManager.manager.emit(
							Events.Debug,
							DebugLevels.Node,
							`[Socket] -> [${this.id}]: Resuming session... | Timeout: ${timeout}ms`,
						);

						await this.updateSession(isResumable, timeout);
					}
				}
				break;

			case OpCodes.Event: {
				const player = this.nodeManager.manager.getPlayer(payload.guildId);
				if (!player) return;

				switch (payload.type) {
					//
					// Events related to tracks.
					//
					case PlayerEventType.TrackEnd:
						await trackEnd.call(player, payload);
						break;
					case PlayerEventType.TrackStart:
						await trackStart.call(player, payload);
						break;
					case PlayerEventType.TrackException:
						await trackError.call(player, payload);
						break;
					case PlayerEventType.TrackStuck:
						await trackStuck.call(player, payload);
						break;

					//
					// Events related to lyrics.
					//
					case PlayerEventType.LyricsFound:
						await lyricsFound.call(player, player.queue.current, payload);
						break;
					case PlayerEventType.LyricsNotFound:
						await lyricsNotFound.call(player, player.queue.current, payload);
						break;
					case PlayerEventType.LyricsLine:
						await lyricsLine.call(player, player.queue.current, payload);
						break;

					//
					// Events related to the websocket.
					//
					case PlayerEventType.WebsocketClosed:
						await socketClosed.call(player, payload);
						break;
				}

				break;
			}

			case OpCodes.PlayerUpdate: {
				await playerUpdate.call(this, payload);
				break;
			}
		}

		this.nodeManager.manager.emit(
			Events.Debug,
			DebugLevels.Node,
			`[Socket] -> [${this.id}]: Received payload: ${JSON.stringify(payload)}`,
		);
	} catch (error) {
		this.nodeManager.manager.emit(Events.NodeError, this, error);
	}
}
