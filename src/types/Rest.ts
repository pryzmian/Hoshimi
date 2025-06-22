import type { Track, TrackRequester } from "../classes/Track";
import type { PickNullable } from "./Manager";
import type { LavalinkTrack } from "./Node";
import type {
	FilterOptions,
	LavalinkPlayerVoice,
	LavalinkPlayOptions,
} from "./Player";

/**
 * The methods for http requests
 */
export enum HttpMethods {
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
 * The status codes for the REST.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
export enum HttpStatusCodes {
	/**
	 * The request has succeeded.
	 */
	OK = 200,
	/**
	 * The request has been fulfilled and resulted in a new resource being created.
	 */
	Created = 201,
	/**
	 * The request has been accepted for processing, but the processing has not been completed.
	 */
	Accepted = 202,
	/**
	 * The server successfully processed the request, but is not returning any content.
	 */
	NoContent = 204,
	/**
	 * The resource has been moved permanently to a new URI.
	 */
	MovedPermanently = 301,
	/**
	 * The requested resource has been found at a different URI.
	 */
	Found = 302,
	/**
	 * The resource has not been modified since the last request.
	 */
	NotModified = 304,
	/**
	 * The request cannot be processed due to bad syntax.
	 */
	BadRequest = 400,
	/**
	 * The request requires user authentication.
	 */
	Unauthorized = 401,
	/**
	 * The request was valid, but the server is refusing action.
	 */
	Forbidden = 403,
	/**
	 * The server cannot find the requested resource.
	 */
	NotFound = 404,
	/**
	 * The request method is known by the server but has been disabled and cannot be used.
	 */
	MethodNotAllowed = 405,
	/**
	 * The server timed out waiting for the request.
	 */
	RequestTimeout = 408,
	/**
	 * The request could not be completed due to a conflict with the current state of the resource.
	 */
	Conflict = 409,
	/**
	 * The requested resource is no longer available and will not be available again.
	 */
	Gone = 410,
	/**
	 * The user has sent too many requests in a given amount of time.
	 */
	TooManyRequests = 429,
	/**
	 * A generic error message, given when no more specific message is suitable.
	 */
	InternalServerError = 500,
	/**
	 * The server does not recognize the request method or lacks the ability to fulfill it.
	 */
	NotImplemented = 501,
	/**
	 * The server was acting as a gateway and received an invalid response.
	 */
	BadGateway = 502,
	/**
	 * The server is currently unavailable (overloaded or down).
	 */
	ServiceUnavailable = 503,
	/**
	 * The server did not receive a timely response from an upstream server.
	 */
	GatewayTimeout = 504,
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
	 * @type {HttpMethods}
	 */
	method?: HttpMethods;
	/**
	 * The headers for the REST.
	 * @type {Record<string, string>}
	 */
	headers?: Record<string, string>;
	/**
	 * The body for the REST.
	 * @type {Record<string, unknown> | string | undefined}
	 */
	body?: Record<string, unknown> | string;
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
	/**
	 * The state of the player.
	 * @type {LavalinkPlayerState}
	 */
	state: LavalinkPlayerState;
}

/**
 * The state of the player.
 */
export interface LavalinkPlayerState {
	/**
	 * The time since the connection was established.
	 * @type {number}
	 */
	time: number;
	/**
	 * The position of the current track in milliseconds.
	 * @type {number}
	 */
	position: number;
	/**
	 * Whether the player is connected to the voice channel.
	 * @type {boolean}
	 */
	connected: boolean;
	/**
	 * The ping to the voice server in milliseconds.
	 * @type {number}
	 */
	ping: number;
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

/**
 * The rest options.
 */
export interface HoshimiRestOptions {
	/**
	 * The amount of time to wait for the player to resume. (in milliseconds)
	 * @type {number}
	 * @default 10000
	 */
	resumeTimeout?: number;
}

/**
 * The methods for decoding base64 encoded tracks.
 */
export interface DecodeMethods {
	/**
	 *
	 * Decodes a single base64 encoded track.
	 * @param {string} track The base64 encoded track.
	 * @param {TrackRequester} requester The requester of the track.
	 * @return {Promise<Track>} The decoded track.
	 * @example
	 * ```ts
	 * const node = player.node;
	 * const track = await node.decode.single("base64EncodedTrack");
	 * console.log(track.info.title); // Track Title
	 * ```
	 */
	single(track: string, requester: TrackRequester): Promise<Track>;
	/**
	 * Decodes multiple base64 encoded tracks.
	 * @param {string[]} tracks The base64 encoded tracks.
	 * @param {TrackRequester} requester The requester of the tracks.
	 * @return {Promise<Track[]>} The decoded tracks.
	 * @example
	 * ```ts
	 * const node = player.node;
	 * const tracks = await node.decode.multiple(["base64EncodedTrack1", "base64EncodedTrack2"]);
	 * console.log(tracks[0].info.title); // Track Title 1
	 * console.log(tracks[1].info.title); // Track Title 2
	 * ```
	 */
	multiple(tracks: string[], requester: TrackRequester): Promise<Track[]>;
}

/**
 * The session of the node.
 */
export type NullableLavalinkSession = PickNullable<LavalinkSession, "timeout">;
