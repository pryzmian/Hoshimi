import {
	type LavalinkSearchResponse,
	type NodeOptions,
	State,
	type ResumableHeaders,
	type SearchQuery,
	type Stats,
	type NodeInfo,
} from "../../types/Node";
import type { Hoshimi } from "../Manager";

import { NodeError } from "../Errors";
import { Rest } from "./Rest";

import { WebSocket } from "ws";

import { onClose, onError, onMessage, onOpen } from "../../util/events/websocket";
import { validateQuery } from "../../util/functions/validations";
import type {
	LavalinkPlayer,
	LavalinkSession,
	NullableLavalinkSession,
	UpdatePlayerInfo,
} from "../../types/Rest";
import { DebugLevels, Events } from "../../types/Manager";

/**
 * Class representing a Lavalink node.
 */
export class Node {
	/**
	 * The options for the node.
	 * @type {NodeOptions}
	 */
	readonly options: NodeOptions;

	/**
	 * The REST for the node.
	 * @type {Rest}
	 */
	readonly rest: Rest;

	/**
	 * The manager for the node.
	 * @type {Hoshimi}
	 */
	readonly manager: Hoshimi;

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
	 * The amount of times the node has tried to reconnect.
	 * @type {number}
	 */
	public reconnectAttempts: number = 0;

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
	 * @param manager The manager for the node.
	 * @param options The options for the node.
	 */
	constructor(manager: Hoshimi, options: NodeOptions) {
		this.manager = manager;
		this.options = {
			id: options.id ?? `${options.host}:${options.port}`,
			restTimeout: options.restTimeout ?? 10000,
			secure: options.secure ?? false,
			retryAmount: options.retryAmount ?? 5,
			retryDelay: options.retryDelay ?? 3000,
			...options,
		};

		if (this.options.secure && this.options.port !== 443) this.options.port = 443;

		this.rest = new Rest(this);
	}

	/**
	 * The id of the node.
	 */
	public get id(): string {
		return this.options.id!;
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
	 * @param query The query to search for.
	 */
	public search(query: SearchQuery): Promise<LavalinkSearchResponse | null> {
		const search = validateQuery({
			...query,
			engine: query.engine ?? this.manager.options.defaultSearchEngine,
		});

		return this.rest.request<LavalinkSearchResponse>({
			endpoint: `/loadtracks?identifier=${search}`,
			params: query.params,
		});
	}

	/**
	 * Connect the node to the server.
	 */
	public async connect(): Promise<void> {
		if (!this.manager.options.client)
			throw new NodeError({
				message: "No valid client data provided.",
				id: this.id,
			});

		if (!this.manager.options.client.id)
			throw new NodeError({
				message: "No valid client id provided.",
				id: this.id,
			});

		this.state = State.Connecting;

		const headers: ResumableHeaders = {
			Authorization: this.options.password,
			"User-Id": this.manager.options.client.id,
			"Client-Name": this.manager.options.client.username!,
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

		this.manager.emit(
			Events.Debug,
			DebugLevels.Node,
			`[Socket] -> [${this.id}]: Connecting to ${this.address}... | State: ${this.state} | Session: ${this.sessionId} | Resumed: ${this.session.resuming} | Penalties: ${this.penalties} | Reconnects: ${this.reconnectAttempts} | Headers: ${JSON.stringify(headers)}`,
		);
	}

	/**
	 *
	 * Stop the track in player for the guild.
	 * @param guildId the guild id to stop the player
	 * @returns
	 */
	public stopPlayer(guildId: string): Promise<LavalinkPlayer | null> {
		return this.rest.stopPlayer(guildId);
	}

	/**
	 *
	 * Update the player data.
	 * @param data The player data to update.
	 * @returns
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
	public disconnect(): void {
		if (this.state !== State.Connected) return;

		this.ws?.close(1000);
		this.ws?.removeAllListeners();
		this.ws = null;

		this.reconnectAttempts = 0;

		if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

		this.manager.emit(Events.NodeDisconnect, this);
	}

	/**
	 *
	 * Update the session for the node
	 * @param resuming Enable resuming for the session.
	 * @param timeout The timeout for the session.
	 * @returns
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
}
