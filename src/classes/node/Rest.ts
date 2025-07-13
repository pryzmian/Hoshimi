import { DebugLevels, Events } from "../../types/Manager";
import type { UserAgent } from "../../types/Node";
import {
	type FetchOptions,
	HttpMethods,
	type LavalinkRestError,
	type RestOptions,
	type LavalinkPlayer,
	type UpdatePlayerInfo,
	type LavalinkSession,
	HttpStatusCodes,
} from "../../types/Rest";
import { HoshimiAgent } from "../../util/constants";
import { validatePlayerData } from "../../util/functions/utils";
import type { Hoshimi } from "../Hoshimi";
import type { Node } from "./Node";

/**
 * The RestError class has been taken from Shoukaku library.
 * A cute and epic lavalink wrapper, made in typescript.
 * So, all the credits goes to the original author.
 * @link https://github.com/shipgirlproject/Shoukaku/blob/master/src/node/Rest.ts
 */

/**
 * Class representing a REST error.
 * @class RestError
 * @extends {Error}
 */
class RestError extends Error {
	/**
	 * The timestamp of the response.
	 * @type {number}
	 */
	public timestamp: number;
	/**
	 * The status of the response.
	 * @type {number}
	 */
	public status: number;
	/**
	 * The error of the response.
	 * @type {string}
	 */
	public error: string;
	/**
	 * The message of the response.
	 * @type {string}
	 */
	public path: string;
	/**
	 * The trace of the response.
	 * @type {string}
	 */
	public trace?: string;

	/**
	 *
	 * Create a new REST error.
	 */
	constructor({ timestamp, status, error, trace, message, path }: LavalinkRestError) {
		super(
			`Rest request failed with response code: ${status}${message ? ` | message: ${message}` : ""}`,
		);

		this.name = "Hoshimi [RestError]";
		this.timestamp = timestamp;
		this.status = status;
		this.error = error;
		this.trace = trace;
		this.message = message;
		this.path = path;
	}
}

/**
 * Class representing the REST for the node.
 * @class Rest
 */
export class Rest {
	/**
	 * The URL for the REST.
	 * @type {string}
	 */
	readonly url: string;

	/**
	 * The version for the REST.
	 * @type {string}
	 */
	readonly version: string = "v4";

	/**
	 * The timeout for the REST.
	 * @type {number}
	 */
	readonly restTimeout: number;

	/**
	 * The user agent for the REST.
	 * @type {UserAgent}
	 */
	readonly userAgent: UserAgent;

	/**
	 * The node for the REST.
	 * @type {Node}
	 */
	readonly node: Node;

	/**
	 *
	 * Create a new REST.
	 * @param {Node} node The node for the REST.
	 * @example
	 * ```ts
	 * const node = new Node({
	 * 	host: "localhost",
	 * 	port: 2333,
	 * 	password: "youshallnotpass",
	 * 	secure: false,
	 * });
	 *
	 * const rest = new Rest(node);
	 * console.log(rest.restUrl); // http://localhost:2333/v4
	 * ```
	 */
	constructor(node: Node) {
		const manager: Hoshimi = node.nodeManager.manager;

		this.url = `${node.options.secure ? "https" : "http"}://${node.options.host}:${node.options.port}/${this.version}`;
		this.restTimeout =
			node.options.restTimeout ?? manager.options.restOptions.resumeTimeout ?? 10000;
		this.userAgent = manager.options.nodeOptions.userAgent ?? HoshimiAgent;
		this.node = node;
	}

	/**
	 * The REST URL to make requests.
	 * @type {string}
	 */
	public get restUrl(): string {
		return this.url;
	}

	/**
	 * The session id of the node.
	 * @type {string}
	 */
	public get sessionId(): string {
		return this.node.sessionId!;
	}

	/**
	 *
	 * Make a request to the node.
	 * @param {RestOptions} options The options to make the request.
	 * @returns {Promise<T | null>} The response from the node.
	 */
	public async request<T>(options: RestOptions): Promise<T | null> {
		const headers = {
			...options.headers,
			"Content-Type": "application/json",
			"User-Agent": this.userAgent,
			Authorization: this.node.options.password,
		};

		options.method ??= HttpMethods.Get;

		const url = new URL(`${this.url}${options.endpoint}`);

		if (options.params) {
			for (const [key, value] of Object.entries(options.params)) {
				url.searchParams.append(key, value);
			}
		}

		url.searchParams.append("trace", "true");

		const abortController = new AbortController();
		const timeout = setTimeout((): void => abortController.abort(), this.restTimeout);

		const fetchOptions: FetchOptions = {
			headers,
			method: options.method,
			signal: abortController.signal,
		};

		if (![HttpMethods.Get, HttpMethods.Head].includes(options.method) && options.body) {
			if (typeof options.body === "string") fetchOptions.body = options.body;
			else fetchOptions.body = JSON.stringify(options.body);
		}

		this.node.nodeManager.manager.emit(
			Events.Debug,
			DebugLevels.Rest,
			`[Rest] -> [${this.node.id} : ${options.method}]: Url: ${this.restUrl} | Endpoint: ${options.endpoint} | Params: ${url.search} | Body: ${options.body ? JSON.stringify(options.body) : "None"} | Headers: ${JSON.stringify(headers)}`,
		);

		const response = await fetch(url.toString(), fetchOptions).finally(() =>
			clearTimeout(timeout),
		);
		if (!response.ok) {
			const restError = (await response.json().catch(() => null)) as LavalinkRestError | null;

			throw new RestError(
				restError ?? {
					timestamp: Date.now(),
					status: response.status,
					error: "Unknown Error",
					message: "Unexpected error response from Lavalink server",
					path: options.endpoint,
				},
			);
		}

		if (response.status === HttpStatusCodes.NoContent) return null;

		return response.json().catch(() => null) as Promise<T | null>;
	}

	/**
	 *
	 * Update the player data.
	 * @param {Partial<UpdatePlayerInfo>} data The player data to update.
	 * @returns {LavalinkPlayer | null} The updated player data.
	 * @example
	 * ```ts
	 * const player = await node.rest.updatePlayer({
	 * 	guildId: "guildId",
	 * 	noReplace: true,
	 * 	playerOptions: {
	 * 		paused: false,
	 * 		track: { encoded: "encoded track" },
	 * 	},
	 * });
	 *
	 * console.log(player); // The updated lavalink player data
	 * ```
	 */
	public updatePlayer(data: Partial<UpdatePlayerInfo>): Promise<LavalinkPlayer | null> {
		if (!this.sessionId) return Promise.resolve(null);

		this.node.nodeManager.manager.emit(
			Events.Debug,
			DebugLevels.Rest,
			`[Rest] -> [${this.node.id}]: Updated player data for guild: ${data.guildId} | Payload: ${JSON.stringify(data)}`,
		);

		validatePlayerData.call(this.node, data);

		return this.request<LavalinkPlayer>({
			method: HttpMethods.Patch,
			endpoint: `/sessions/${this.sessionId}/players/${data.guildId}`,
			body: { ...data.playerOptions },
			params: { noReplace: `${data.noReplace ?? false}` },
		});
	}

	/**
	 *
	 * Stop the track in player for the guild.
	 * @param {string} guildId the guild id to stop the player
	 * @returns {Promise<LavalinkPlayer | null>} The updated player data.
	 * @example
	 * ```ts
	 * const player = await node.rest.stopPlayer("guildId");
	 * if (player) console.log(player); // The lavalink player
	 * ```
	 */
	public stopPlayer(guildId: string): Promise<LavalinkPlayer | null> {
		if (!this.sessionId) return Promise.resolve(null);

		this.node.nodeManager.manager.emit(
			Events.Debug,
			DebugLevels.Rest,
			`[Rest] -> [${this.node.id}]: Stopped player for guild: ${guildId}`,
		);

		return this.updatePlayer({
			guildId,
			playerOptions: {
				paused: false,
				track: { encoded: null },
			},
		});
	}

	/**
	 *
	 * Destroy the player for the guild.
	 * @param {string} guildId The guild id to destroy the player.
	 * @returns {Promise<void>} The updated player data.
	 * @example
	 * ```ts
	 * await node.rest.destroyPlayer("guildId");
	 * ```
	 * @example
	 */
	public async destroyPlayer(guildId: string): Promise<void> {
		if (!this.sessionId) return;

		this.node.nodeManager.manager.emit(
			Events.Debug,
			DebugLevels.Rest,
			`[Rest] -> [${this.node.id}]: Destroyed player for guild: ${guildId}`,
		);

		await this.request({
			method: HttpMethods.Delete,
			endpoint: `/sessions/${this.sessionId}/players/${guildId}`,
		});
	}

	/**
	 *
	 * Update the session for the node
	 * @param {boolean} resuming Enable resuming for the session.
	 * @param {number | null} timeout The timeout for the session.
	 * @returns {Promise<LavalinkSession | null>} The updated session data.
	 * @example
	 * ```ts
	 * const session = await node.rest.updateSession(true, 10000);
	 * if (session) console.log(session); // The lavalink session data
	 * ```
	 */
	public updateSession(
		resuming: boolean,
		timeout: number | null = null,
	): Promise<LavalinkSession | null> {
		if (!this.sessionId) return Promise.resolve(null);

		this.node.nodeManager.manager.emit(
			Events.Debug,
			DebugLevels.Rest,
			`[Rest] -> [${this.node.id}]: Updated session for resumed: ${resuming} | Timeout: ${timeout ?? "None"}`,
		);

		return this.request<LavalinkSession>({
			method: HttpMethods.Patch,
			endpoint: `/sessions/${this.sessionId}`,
			body: { resuming, timeout },
		});
	}
}
