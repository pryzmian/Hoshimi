import type { IncomingMessage } from "node:http";
import type { Node } from "../../classes/node/Node";
import { type LavalinkPayload, State, OpCodes, type NodeInfo } from "../../types/Node";
import { DebugLevels, Events } from "../../types/Manager";
import { PlayerEventType } from "../../types/Player";
import { playerUpdate, trackEnd, trackStart } from "./player";

/**
 *
 * Emitted when the socket connection is opened.
 * @param this The node that emitted the event.
 * @param res The response from the socket connection.
 * @returns {void} Nothing new.
 */
export function onOpen(this: Node, res: IncomingMessage): void {
	const isResume = res.headers["session-resumed"] === "true";
	const apiVersion = res.headers["lavalink-api-version"];

	this.manager.emit(
		Events.Debug,
		DebugLevels.Node,
		`[Socket] -> [${this.id}]: Connection handshake complete with ${this.address}. | API Version: ${apiVersion ?? "Unknown"} | Resumed: ${isResume}`,
	);
}

/**
 *
 * Emitted when the socket connection is closed.
 * @param this The node that emitted the event.
 * @param code The close code of the connection.
 * @param reason The close reason message.
 * @returns {void} The same thing as above.
 */
export function onClose(this: Node, code: number, reason: string): void {
	this.manager.emit(
		Events.Debug,
		DebugLevels.Node,
		`[Socket] -> [${this.id}]: Connection closed with ${this.address}. | Code: ${code} | Reason: ${reason}`,
	);

	this.manager.emit(Events.NodeDisconnect, this);

	if (code !== 1000 || reason !== "Node-Destroy") {
		if (this.manager.nodes.has(this.id)) this.reconnect();
	}
}

/**
 *
 * Emitted when an error occurs.
 * @param this The node that emitted the event.
 * @param error The error that occurred.
 * @returns {void} Did you know that void is a type in TypeScript?
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
 * @returns {Promise<void>} I'm running out of ideas for this.
 */
export async function onMessage(this: Node, message: Buffer | string): Promise<void> {
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
							`[Socket] -> [${this.id}]: Session id was not provided. Breaking up the connection...`,
						);
						this.disconnect();
						return;
					}

					this.state = State.Connected;
					this.sessionId = payload.sessionId;
					this.session.resuming = payload.resumed;

					this.info = await this.rest.request<NodeInfo>({ endpoint: "/info" });

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
						await trackEnd.call(player, payload);
						break;
					case PlayerEventType.TrackStart:
						await trackStart.call(player, payload);
						break;
				}

				break;
			}

			case OpCodes.PlayerUpdate: {
				await playerUpdate.call(this, payload);
				break;
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
