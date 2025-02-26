import { DebugLevels, Events } from "../../types/Manager";
import {
	type FetchOptions,
	HttpMethods,
	type LavalinkRestError,
	type RestOptions,
	type LavalinkPlayer,
	type UpdatePlayerInfo,
	type LavalinkSession,
} from "../../types/Rest";
import { HoshimiAgent } from "../../util/constants";
import { validatePlayerData } from "../../util/functions/validations";
import type { Node } from "./Node";

/**
 * The RestError class has been taken from Shoukaku library.
 * A cute and epic library for lavalink, made in typescript.
 * So, all the credits goes to the original author.
 * @link https://github.com/shipgirlproject/Shoukaku/blob/master/src/node/Rest.ts
 */

/**
 * Class representing a REST error.
 */
class RestError extends Error {
	/**
	 * The timestamp of the response.
	 */
	public timestamp: number;
	/**
	 * The status of the response.
	 */
	public status: number;
	/**
	 * The error of the response.
	 */
	public error: string;
	/**
	 * The message of the response.
	 */
	public path: string;
	/**
	 * The trace of the response.
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
	 * @type {string}
	 */
	readonly userAgent: string = HoshimiAgent;

	/**
	 * The node for the REST.
	 * @type {Node}
	 */
	readonly node: Node;

	/**
	 *
	 * Create a new REST.
	 * @param node The node for the REST.
	 */
	constructor(node: Node) {
		this.url = `${node.options.secure ? "https" : "http"}://${node.options.host}:${node.options.port}/${this.version}`;
		this.restTimeout = node.options.restTimeout ?? 10000;
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
	 *
	 * Make a request to the node.
	 * @param options The options to make the request.
	 * @returns {Promise<T | null>}
	 */
	public async request<T>(options: RestOptions): Promise<T | null> {
		const headers = {
			"Content-Type": "application/json",
			"User-Agent": this.userAgent,
			Authorization: this.node.options.password,
			...options.headers,
		};

		options.method ??= HttpMethods.Get;

		const url = new URL(`${this.url}${options.endpoint}`);

		if (options.params) url.search = new URLSearchParams(options.params).toString();

		const abortController = new AbortController();
		const timeout = setTimeout(() => abortController.abort(), this.restTimeout);

		const fetchOptions: FetchOptions = {
			headers,
			method: options.method,
			signal: abortController.signal,
		};

		if (![HttpMethods.Get, HttpMethods.Head].includes(options.method) && options.body) {
			fetchOptions.body = JSON.stringify(options.body);
		}

		this.node.manager.emit(
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

		if (response.status === 204) return null;

		return response.json().catch(() => null) as Promise<T | null>;
	}

	/**
	 *
	 * Update the player data.
	 * @param data The player data to update.
	 * @returns
	 */
	public async updatePlayer(data: Partial<UpdatePlayerInfo>): Promise<LavalinkPlayer | null> {
		if (!this.node.sessionId) return null;

		const res = await this.request<LavalinkPlayer>({
			method: HttpMethods.Patch,
			endpoint: `/sessions/${this.node.sessionId}/players/${data.guildId}`,
			body: { ...data.playerOptions },
			params: { noReplace: `${data.noReplace ?? false}` },
		});

		this.node.manager.emit(
			Events.Debug,
			DebugLevels.Rest,
			`[Rest] -> [${this.node.id}]: Updated player data for guild: ${data.guildId} | Object: ${JSON.stringify(data)}`,
		);

		validatePlayerData.call(this.node, data);

		return res;
	}

	/**
	 *
	 * Stop the track in player for the guild.
	 * @param guildId the guild id to stop the player
	 * @returns
	 */
	public async stopPlayer(guildId: string): Promise<LavalinkPlayer | null> {
		if (!this.node.sessionId) return null;

		this.node.manager.emit(
			Events.Debug,
			DebugLevels.Rest,
			`[Rest] -> [${this.node.id}]: Stopped player for guild: ${guildId}`,
		);

		const res = await this.updatePlayer({
			guildId,
			playerOptions: {
				paused: false,
				track: { encoded: null },
			},
		});

		return res;
	}

	/**
	 *
	 * Destroy the player for the guild.
	 * @param guildId The guild id to destroy the player.
	 */
	public async destroyPlayer(guildId: string): Promise<void> {
		if (!this.node.sessionId) return;

		this.node.manager.emit(
			Events.Debug,
			DebugLevels.Rest,
			`[Rest] -> [${this.node.id}]: Destroyed player for guild: ${guildId}`,
		);

		await this.request({
			method: HttpMethods.Delete,
			endpoint: `/sessions/${this.node.sessionId}/players/${guildId}`,
		});
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
		if (!this.node.sessionId) return null;

		this.node.manager.emit(
			Events.Debug,
			DebugLevels.Rest,
			`[Rest] -> [${this.node.id}]: Updated session for resumed: ${resuming} | Timeout: ${timeout ?? "None"}`,
		);

		const res = await this.request<LavalinkSession>({
			method: HttpMethods.Patch,
			endpoint: `/sessions/${this.node.sessionId}`,
			body: { resuming, timeout },
		});

		return res;
	}
}
