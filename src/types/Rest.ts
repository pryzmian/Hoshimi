import type { PickNullable } from "./Manager";
import type { LavalinkTrack } from "./Node";
import type { FilterOptions, LavalinkPlayerVoice, LavalinkPlayOptions } from "./Player";

/**
 * The methods for the REST.
 */
export enum RestMethods {
	/**
	 * The GET method requests a representation of the specified resource. Requests using GET should only retrieve data.
	 */
	Get = "GET",
	/**
	 * The POST method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server.
	 */
	Post = "POST",
	/**
	 * The PUT method replaces all current representations of the target resource with the request payload.
	 */
	Put = "PUT",
	/**
	 * The PATCH method is used to apply partial modifications to a resource.
	 */
	Patch = "PATCH",
	/**
	 * The DELETE method deletes the specified resource.
	 */
	Delete = "DELETE",
	/**
	 * The HEAD method asks for a response identical to that of a GET request, but without the response body.
	 */
	Head = "HEAD",
}

/**
 * The options for the REST.
 */
export interface RestOptions {
	/**
	 * The endpoint for the REST.
	 * @type {string}
	 */
	endpoint: `/${string}`;
	/**
	 * The method for the REST.
	 * @type {RestMethods}
	 */
	method?: RestMethods;
	/**
	 * The headers for the REST.
	 * @type {Record<string, string>}
	 */
	headers?: Record<string, string>;
	/**
	 * The body for the REST.
	 * @type {Record<string, unknown>}
	 */
	body?: Record<string, unknown>;
	/**
	 * The query parameters for the REST.
	 * @type {Record<string, string>}
	 */
	params?: Record<string, string>;
}

/**
 * The fetch options for the request.
 */
export interface FetchOptions extends Omit<RestOptions, "endpoint" | "body"> {
	/**
	 * The signal for the request.
	 */
	signal: AbortSignal;
	/**
	 * The stringified body for the request.
	 */
	body?: string;
}

/**
 * The error for the REST.
 */
export interface LavalinkRestError {
	/**
	 * The timestamp for the REST.
	 * @type {number}
	 */
	timestamp: number;
	/**
	 * The status for the REST.
	 * @type {number}
	 */
	status: number;
	/**
	 * The error for the REST.
	 * @type {string}
	 */
	error: string;
	/**
	 * The trace for the REST.
	 * @type {string}
	 */
	trace?: string;
	/**
	 * The message for the REST.
	 * @type {string}
	 */
	message: string;
	/**
	 * The path for the REST.
	 * @type {string}
	 */
	path: string;
}

/**
 * The player response from the Lavalink REST API.
 */
export interface LavalinkPlayer {
	/**
	 * The guild ID associated with the player.
	 * @type {string}
	 */
	guildId: string;
	/**
	 * The track currently being played.
	 * @type {LavalinkTrack}
	 */
	track?: LavalinkTrack;
	/**
	 * The volume of the player.
	 * @type {number}
	 */
	volume: number;
	/**
	 * Whether the player is paused.
	 * @type {boolean}
	 */
	paused: boolean;
	/**
	 * The voice connection details.
	 * @type {LavalinkPlayerVoice}
	 */
	voice: LavalinkPlayerVoice;
	/**
	 * The filter options applied to the player.
	 * @type {FilterOptions}
	 */
	filters: FilterOptions;
}

/**
 * The options to update the player.
 */
export interface UpdatePlayerInfo {
	/**
	 * The guild id associated with the player.
	 * @type {string}
	 */
	guildId: string;
	/**
	 * The options to update the player.
	 * @type {LavalinkPlayOptions}
	 */
	playerOptions: LavalinkPlayOptions;
	/**
	 * Whether to replace the current track.
	 * @type {boolean | undefined}
	 * @default false
	 */
	noReplace?: boolean;
}

/**
 * The updated session of the current session.
 */
export interface LavalinkSession {
	/**
	 * Whather the session is resuming.
	 * @type {boolean}
	 */
	resuming: boolean;
	/**
	 * The timeout for the session.
	 * @type {number}
	 */
	timeout: number;
}

export type NullableLavalinkSession = PickNullable<LavalinkSession, "timeout">;
