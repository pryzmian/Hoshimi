import {
	type LavalinkSearchResponse,
	type NodeOptions,
	State,
	type ResumableHeaders,
	type SearchQuery,
	type Stats,
	type NodeInfo,
	type NodeDestroyInfo,
	type NodeDisconnectInfo,
} from "../../types/Node";

import { NodeError } from "../Errors";
import { Rest } from "./Rest";

import { onClose, onError, onMessage, onOpen } from "../../util/events/websocket";
import type {
	LavalinkPlayer,
	LavalinkSession,
	NullableLavalinkSession,
	UpdatePlayerInfo,
} from "../../types/Rest";
import type { NodeManager } from "./Manager";

import { DebugLevels, Events } from "../../types/Manager";
import { validateQuery } from "../../util/functions/validations";
import { WebSocket } from "ws";

/**
 * Class representing a Lavalink node.
 */
export class Node {
	/**
	 * The options for the node.
	 * @type {Required<NodeOptions>}
	 */
	readonly options: Required<NodeOptions>;

	/**
	 * The REST for the node.
	 * @type {Rest}
	 */
	readonly rest: Rest;

	/**
	 * The manager for the node.
	 * @type {NodeManager}
	 */
	readonly nodeManager: NodeManager;

	/**
	 * The delay between reconnect attempts.
	 * @type {number}
	 */
	readonly retryDelay: number;

	/**
	 * The amount of reconnect attempts left.
	 * @type {number}
	 */
	public retryAmount: number;

	/**
	 * The WebSocket for the node.
	 * @type {WebSocket | null}
	 */
	public ws: WebSocket | null = null;

	/**
	 * The state of the node.
	 * @type {State}
	 */
	public state: State = State.Idle;

	/**
	 * The session id of the node.
	 */
	public sessionId: string | null = null;

	/**
	 * The interval for the reconnect.
	 * @type {NodeJS.Timeout | null}
	 */
	public reconnectTimeout: NodeJS.Timeout | null = null;

	/**
	 * The public stats of the node.
	 * @type {Stats | null}
	 */
	public stats: Stats | null = null;

	/**
	 * The public info of the node.
	 * @type {NodeInfo | null}
	 */
	public info: NodeInfo | null = null;

	/**
	 * The session of the node.
	 * @type {NullableLavalinkSession}
	 */
	public session: NullableLavalinkSession = {
		timeout: null,
		resuming: false,
	};

	/**
	 *
	 * Create a new Lavalink node.
	 * @param {NodeManager} nodeManager The manager for the node.
	 * @param {NodeOptions} options The options for the node.
	 */
	constructor(nodeManager: NodeManager, options: NodeOptions) {
		this.options = {
			...options,
			sessionId: options.sessionId ?? "",
			id: options.id ?? `${options.host}:${options.port}`,
			restTimeout: options.restTimeout ?? 10000,
			secure: options.secure ?? false,
			retryAmount: options.retryAmount ?? 5,
			retryDelay: options.retryDelay ?? 20000,
		};

		this.retryAmount = this.options.retryAmount;
		this.retryDelay = this.options.retryDelay;
		this.nodeManager = nodeManager;

		if (this.options.secure && this.options.port !== 443) this.options.port = 443;

		this.rest = new Rest(this);
	}

	/**
	 * The id of the node.
	 */
	public get id(): string {
		return this.options.id;
	}

	/**
	 * The socket address to connect the node.
	 * @type {string}
	 */
	public get address(): string {
		return `${this.options.secure ? "wss" : "ws"}://${this.options.host}:${this.options.port}/${this.rest.version}/websocket`;
	}

	/**
	 * The penalties of the node.
	 * @type {number}
	 * @readonly
	 */
	public get penalties(): number {
		if (!this.stats) return 0;

		const { players, cpu, frameStats } = this.stats;
		const cpuPenalty = Math.round(1.05 ** (100 * cpu.systemLoad) * 10 - 10);
		const framePenalty = frameStats ? frameStats.deficit + frameStats.nulled * 2 : 0;

		return players + cpuPenalty + framePenalty;
	}

	/**
	 *
	 * Search for a query.
	 * @param {SearchQuery} search The query to search for.
	 */
	public search(search: SearchQuery): Promise<LavalinkSearchResponse | null> {
		search.engine ??= this.nodeManager.manager.options.defaultSearchEngine;

		const identifier = validateQuery(search);

		return this.rest.request<LavalinkSearchResponse>({
			endpoint: `/loadtracks?identifier=${identifier}`,
			params: search.params,
		});
	}

	/**
	 * Connect the node to the websocket.
	 * @returns {void}
	 */
	public connect(): void {
		if (!this.nodeManager.manager.options.client)
			throw new NodeError({
				message: "No valid client data provided.",
				id: this.id,
			});

		if (!this.nodeManager.manager.options.client.id)
			throw new NodeError({
				message: "No valid client id provided.",
				id: this.id,
			});

		this.state = State.Connecting;

		const headers: ResumableHeaders = {
			Authorization: this.options.password,
			"User-Id": this.nodeManager.manager.options.client.id,
			"Client-Name": this.nodeManager.manager.options.client.username!,
			"User-Agent": this.rest.userAgent,
		};

		if (this.options.sessionId) {
			headers["Session-Id"] = this.options.sessionId;
			this.sessionId = this.options.sessionId;
		}

		this.ws = new WebSocket(this.address, { headers: { ...headers } });

		this.ws.on("upgrade", onOpen.bind(this));
		this.ws.on("close", onClose.bind(this));
		this.ws.on("error", onError.bind(this));
		this.ws.on("message", onMessage.bind(this));

		this.nodeManager.manager.emit(
			Events.Debug,
			DebugLevels.Node,
			`[Socket] -> [${this.id}]: Connecting to ${this.address}... | State: ${this.state} | Session: ${this.sessionId} | Resumed: ${this.session.resuming} | Penalties: ${this.penalties} | Reconnects: ${this.retryAmount} | Headers: ${JSON.stringify(headers)}`,
		);
	}

	/**
	 *
	 * Stop the track in player for the guild.
	 * @param {string} guildId the guild id to stop the player
	 * @returns {Promise<LavalinkPlayer | null>}
	 */
	public stopPlayer(guildId: string): Promise<LavalinkPlayer | null> {
		return this.rest.stopPlayer(guildId);
	}

	/**
	 *
	 * Update the player data.
	 * @param {Partial<UpdatePlayerInfo>} data The player data to update.
	 * @returns {Promise<LavalinkPlayer | null>}
	 */
	public updatePlayer(data: Partial<UpdatePlayerInfo>): Promise<LavalinkPlayer | null> {
		return this.rest.updatePlayer(data);
	}

	/**
	 * Destroy the player.
	 * @returns {Promise<void>}
	 */
	public destroyPlayer(guildId: string): Promise<void> {
		return this.rest.destroyPlayer(guildId);
	}

	/**
	 *
	 * Disconnect the node from the websocket.
	 * @returns {Promise<void>}
	 */
	public disconnect(disconnect: NodeDisconnectInfo = {}): void {
		if (this.state !== State.Connected) return;

		this.ws?.close(disconnect.code, disconnect.reason);
		this.ws?.removeAllListeners();
		this.ws = null;
		this.state = State.Disconnected;

		this.retryAmount = this.options.retryAmount;

		if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

		this.nodeManager.manager.emit(Events.NodeDisconnect, this);
	}

	/**
	 *
	 * Destroy the node.
	 * @param {NodeDestroyInfo} [destroy] The destroy options for the node.
	 * @returns {void}
	 */
	public destroy(destroy: NodeDestroyInfo = {}): void {
		if (this.state !== State.Connected) return;

		this.ws?.close(destroy.code, destroy.reason);
		this.ws?.removeAllListeners();
		this.ws = null;
		this.state = State.Destroyed;

		this.retryAmount = 0;

		if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

		this.nodeManager.manager.emit(Events.NodeDestroy, this, destroy);
		this.nodeManager.deleteNode(this.id);
	}

	/**
	 *
	 * Update the session for the node
	 * @param {boolean} resuming Enable resuming for the session.
	 * @param {number | null} timeout The timeout for the session.
	 * @returns {Promise<LavalinkSession | null>}
	 */
	public async updateSession(
		resuming: boolean,
		timeout: number | null = null,
	): Promise<LavalinkSession | null> {
		if (!this.sessionId) return null;

		const res = await this.rest.updateSession(resuming, timeout);
		if (res) this.session = res;

		return res;
	}

	/**
	 * Reconnect the node.
	 * @returns {void}
	 */
	public reconnect(): void {
		this.state = State.Idle;

		this.nodeManager.manager.emit(
			Events.NodeReconnecting,
			this,
			this.retryAmount,
			this.retryDelay,
		);

		this.reconnectTimeout = setTimeout(() => {
			this.reconnectTimeout = null;

			if (this.retryAmount === 0) {
				this.destroy({ code: 1000, reason: "Node-Destroy" });
				this.nodeManager.manager.emit(
					Events.NodeError,
					this,
					new NodeError({
						message: `Failed to reconnect after ${this.options.retryAmount} retries.`,
						id: this.id,
					}),
				);

				return;
			}

			this.ws?.removeAllListeners();
			this.ws = null;
			this.retryAmount--;
			this.connect();
		}, this.options.retryDelay);
	}
}
