import type { Node } from "../classes/node/Node";
import type { Player } from "../classes/player/Player";
import type { Queue } from "../classes/queue/Queue";
import type { TrackRequester, Track } from "../classes/Track";
import type {
	Exception,
	HoshimiNodeOptions,
	LavalinkPayload,
	LoadType,
	NodeDestroyInfo,
	NodeOptions,
	Playlist,
	PluginInfo,
	Ready,
	SearchQuery,
} from "./Node";
import type {
	LyricsFoundEvent,
	LyricsLineEvent,
	LyricsNotFoundEvent,
	PlayerJson,
	PlayerUpdate,
	TrackEndEvent,
	TrackExceptionEvent,
	TrackStartEvent,
	TrackStuckEvent,
	WebSocketClosedEvent,
} from "./Player";
import type { HoshimiQueueOptions } from "./Queue";
import type { HoshimiRestOptions } from "./Rest";

/**
 * The search engines to use.
 */
export enum SearchEngines {
	/**
	 * Search on YouTube.
	 */
	Youtube = "ytsearch",
	/**
	 * Search on YouTube Music.
	 */
	YoutubeMusic = "ytmsearch",
	/**
	 * Search on Spotify.
	 */
	Spotify = "spsearch",
	/**
	 * Search on Spotify recommendations.
	 */
	SpotifyRecommendations = "sprec",
	/**
	 * Search on SoundCloud.
	 */
	SoundCloud = "scsearch",
	/**
	 * Search on Apple Music.
	 */
	AppleMusic = "amsearch",
	/**
	 * Search on Bandcamp.
	 */
	BandCamp = "bcsearch",
	/**
	 * Search on Vimeo.
	 */
	Vimeo = "vmsearch",
	/**
	 * Search on Deezer.
	 */
	Deezer = "dzsearch",
	/**
	 * Search on Twitch.
	 */
	Twitch = "twsearch",
	/**
	 * Search on Mixer.
	 */
	Mixer = "mxsearch",
	/**
	 * Search on Yandex Music.
	 */
	YandexMusic = "ymsearch",
	/**
	 * Play voice using flowery tts.
	 */
	FloweryTTS = "ftts",
	/**
	 * Play a local file.
	 */
	Local = "local",
}

/**
 * The debug levels for the manager.
 */
export enum DebugLevels {
	/**
	 * Debug level for the manager.
	 */
	Manager = 1,
	/**
	 * Debug level for the node.
	 */
	Node = 2,
	/**
	 * Debug level for the player.
	 */
	Player = 3,
	/**
	 * Debug level for the rest.
	 */
	Rest = 4,
	/**
	 * Debug level for the queue.
	 */
	Queue = 5,
	/**
	 * Debug level for testing purposes.
	 */
	Test = 6,
}

/**
 * The events for the manager.
 */
export enum Events {
	/**
	 * Emitted when the manager emits a debug message.
	 */
	Debug = "debug",
	/**
	 * Emitted when the manager emits an error.
	 */
	Error = "error",
	/**
	 * Emitted when the node gives a response.
	 */
	NodeRaw = "nodeRaw",
	/**
	 * Emitted when the node gives an error.
	 */
	NodeError = "nodeError",
	/**
	 * Emitted when the node is ready.
	 */
	NodeReady = "nodeReady",
	/**
	 * Emitted when the node is disconnected.
	 */
	NodeDisconnect = "nodeDisconnect",
	/**
	 * Emitted when the node reconnects.
	 */
	NodeReconnecting = "nodeReconnecting",
	/**
	 * Emitted when the node is destroyed.
	 */
	NodeDestroy = "nodeDestroy",

	/**
	 * Emitted when the player is created.
	 */
	PlayerCreate = "playerCreate",
	/**
	 * Emitted when the player updates.
	 */
	PlayerUpdate = "playerUpdate",
	/**
	 * Emitted when the player is destroyed.
	 */
	PlayerDestroy = "playerDestroy",

	/**
	 * Emitted when a track starts playing.
	 */
	TrackStart = "trackStart",
	/**
	 * Emitted when a track ends.
	 */
	TrackEnd = "trackEnd",
	/**
	 * Emitted when a track is stuck.
	 */
	TrackStuck = "trackStuck",
	/**
	 * Emitted when a track is errored.
	 */
	TrackError = "trackError",

	/**
	 * Emitted when lyrics are found.
	 */
	LyricsFound = "lyricsFound",
	/**
	 * Emitted when lyrics are not found.
	 */
	LyricsNotFound = "lyricsNotFound",
	/**
	 * Emitted when a line of lyrics is updated.
	 */
	LyricsLine = "lyricsLine",

	/**
	 * Emitted when the queue ends.
	 */
	QueueEnd = "queueEnd",
	/**
	 * Emitted when the queue updates.
	 */
	QueueUpdate = "queueUpdate",

	/**
	 * Emitted when the socket is closed.
	 */
	WebSocketClosed = "socketClosed",
}

/**
 * The destroy reasons for the player.
 */
export enum DestroyReasons {
	/**
	 * The player was stopped.
	 */
	Stop = "Player-Stop",
	/**
	 * The player was destroyed by user request.
	 */
	Requested = "Player-Requested",
	/**
	 * The queue was empty.
	 */
	Empty = "Player-Empty",

	/**
	 * The player because the node was disconnected.
	 */
	NodeDisconnected = "Player-NodeDisconnected",
	/**
	 * The player because the node was destroyed.
	 */
	NodeDestroy = "Player-NodeDestroy",
}

/**
 * The client data for the manager.
 */
export interface ClientData extends Record<string | number | symbol, unknown> {
	/**
	 * The id of the client.
	 * @type {string}
	 */
	id: string;
	/**
	 * The username of the client.
	 * @type {string}
	 */
	username?: string;
}

/**
 * Gateway send payload.
 */
export interface GatewaySendPayload {
	/**
	 * Payload op code.
	 * @type {number}
	 */
	op: number;
	/**
	 * Payload data.
	 * @type {GatewayPayload}
	 */
	d: GatewayPayload;
}

/**
 * Gateway payload.
 */
export interface GatewayPayload {
	/**
	 * Payload guild id.
	 * @type {string}
	 */
	guild_id: string;
	/**
	 * Payload channel id.
	 * @type {string | null}
	 */
	channel_id: string | null;
	/**
	 * Payload self mute.
	 * @type {boolean}
	 */
	self_mute: boolean;
	/**
	 * Payload self deafen.
	 * @type {boolean}
	 */
	self_deaf: boolean;
}

/**
 * The options for the manager.
 */
export interface HoshimiOptions {
	/**
	 *
	 * Send the payload to discord.
	 * @param {string} guildId The guild id to send the payload to.
	 * @param {GatewaySendPayload} payload The payload to send.
	 */
	sendPayload(guildId: string, payload: GatewaySendPayload): Awaitable<void>;
	/**
	 * The nodes to use.
	 * @type {NodeOptions[]}
	 */
	nodes: NodeOptions[];
	/**
	 * The client data to use.
	 * @type {ClientData}
	 */
	client?: Partial<ClientData>;
	/**
	 * The default search engine to use.
	 * @type {SearchEngines}
	 * @default SearchEngines.Youtube
	 */
	defaultSearchEngine?: SearchEngines;
	/**
	 * The queue options to use.
	 * @type {HoshimiQueueOptions}
	 */
	queueOptions?: HoshimiQueueOptions;
	/**
	 * The node options to use.
	 * @type {HoshimiNodeOptions}
	 */
	nodeOptions?: HoshimiNodeOptions;
	/**
	 * The rest options to use.
	 * @type {HoshimiRestOptions}
	 */
	restOptions?: HoshimiRestOptions;
}

/**
 * The events for the manager.
 */
export interface HoshimiEvents {
	/**
	 * Emitted when the manager emits a debug message.
	 * @param {DebugLevels} level The debug level of the message.
	 * @param {string} message The message that was emitted.
	 */
	debug: [level: DebugLevels, message: string];
	/**
	 * Emitted when the manager emits an error.
	 * @param {Error | unknown} error The error that was emitted.
	 */
	error: [error: Error | unknown];

	/**
	 * Emitted when the node gives a response.
	 * @param {Node} node The node that emitted the event.
	 * @param {LavalinkPayload} message The message that was received.
	 */
	nodeRaw: [node: Node, message: LavalinkPayload];
	/**
	 * Emitted when the node gives an error.
	 * @param {Node} node The node that emitted the event.
	 * @param {Error | unknown} error The error that was received.
	 */
	nodeError: [node: Node, error: Error | unknown];
	/**
	 * Emitted when the node is ready.
	 * @param {Node} node The node that emitted the event.
	 * @param {Ready} payload The payload of the event.
	 */
	nodeReady: [node: Node, payload: Ready];
	/**
	 * Emitted when the node is disconnected.
	 * @param {Node} node The node that was disconnected.
	 */
	nodeDisconnect: [node: Node];
	/**
	 * Emitted when the node reconnects.
	 * @param {Node} node The node that was reconnected.
	 * @param {number} retriesLeft The number of retries left.
	 * @param {number} delay The delay before the next retry.
	 */
	nodeReconnecting: [node: Node, retriesLeft: number, delay: number];
	/**
	 * Emitted when the node is destroyed.
	 * @param {Node} node The node that was destroyed.
	 * @param {NodeDestroyInfo} options The options for the destroy.
	 */
	nodeDestroy: [node: Node, destroy: NodeDestroyInfo];

	/**
	 * Emitted when the player is created.
	 * @param {Player} player The player that was created.
	 */
	playerCreate: [player: Player];
	/**
	 * Emitted when the player updates.
	 * @param {Player} newPlayer The new player.
	 * @param {PlayerJson} oldPlayer The old player.
	 */
	playerUpdate: [newPlayer: Player, oldPlayer: PlayerJson, payload: PlayerUpdate];
	/**
	 * Emitted when the player is destroyed.
	 * @param {Player} player The player that was destroyed.
	 * @param {string} reason The reason for the destroy.
	 */
	playerDestroy: [player: Player, reason: string];

	/**
	 * Emitted when a track starts playing.
	 * @param {Player} player The player that emitted the event.
	 * @param {Track | null} track The track that was started.
	 * @param {TrackStartEvent} payload The payload of the event.
	 */
	trackStart: [player: Player, track: Track | null, payload: TrackStartEvent];
	/**
	 * Emitted when a track ends.
	 * @param {Player} player The player that emitted the event.
	 * @param {Track | null} track The track that ended.
	 * @param {TrackEndEvent} payload The payload of the event.
	 */
	trackEnd: [player: Player, track: Track | null, payload: TrackEndEvent];
	/**
	 * Emitted when the track is stuck.
	 * @param {Player} player The player that emitted the event.
	 * @param {Track | null} track The track that was stuck.
	 * @param {TrackEndEvent} payload The payload of the event.
	 */
	trackStuck: [player: Player, track: Track | null, payload: TrackStuckEvent];
	/**
	 * Emitted when a track is errored.
	 * @param {Player} player The player that emitted the event.
	 * @param {Track | null} track The track that was errored.
	 * @param {TrackEndEvent} payload The payload of the event.
	 */
	trackError: [player: Player, track: Track | null, payload: TrackExceptionEvent];

	/**
	 * Emitted when lyrics are found.
	 * @param {Player} player The player that emitted the event.
	 * @param {Track | null} track The track that was found.
	 * @param {LyricsFoundEvent} payload The lyrics that were found.
	 */
	lyricsFound: [player: Player, track: Track | null, payload: LyricsFoundEvent];
	/**
	 * Emitted when lyrics are not found.
	 * @param {Player} player The player that emitted the event.
	 * @param {Track | null} track The track that was not found.
	 * @param {LyricsFoundEvent} payload The lyrics that were not found.
	 */
	lyricsNotFound: [player: Player, track: Track | null, payload: LyricsNotFoundEvent];
	/**
	 * Emitted when a line of lyrics is updated.
	 * @param {Player} player The player that emitted the event.
	 * @param {Track | null} track The track that was updated.
	 * @param {LyricsFoundEvent} payload The lyrics that were updated.
	 */
	lyricsLine: [player: Player, track: Track | null, payload: LyricsLineEvent];

	/**
	 * Emitted when the queue ends.
	 * @param {Player} player The player that emitted the event.
	 * @param {Queue} queue The queue that ended.
	 */
	queueEnd: [player: Player, queue: Queue];
	/**
	 * Emitted when the queue updates.
	 * @param {Player} player The player that emitted the event.
	 * @param {Queue} queue The queue that updated.
	 */
	queueUpdate: [player: Player, queue: Queue];

	/**
	 * Emitted when the socket is closed.
	 * @param {Player} player The player that emitted the event.
	 * @param {WebSocketClosedEvent} payload The payload of the event.
	 */
	socketClosed: [player: Player, payload: WebSocketClosedEvent];
}

/**
 * The manager search result.
 */
export interface QueryResult {
	/**
	 * The load type of the search result.
	 * @type {LoadType}
	 */
	loadType: LoadType;
	/**
	 * The playlist of the search result.
	 * @type {Playlist | null}
	 */
	playlist: Playlist | null;
	/**
	 * The exception of the search result.
	 * @type {Exception | null}
	 */
	exception: Exception | null;
	/**
	 * The tracks of the search result.
	 * @type {Track[]}
	 */
	tracks: Track[];
	/**
	 * The plugin info of the search result.
	 * @type {PluginInfo}
	 */
	pluginInfo: PluginInfo | null;
}

/**
 * The query options.
 */
export interface SearchOptions extends SearchQuery {
	/**
	 * The requester of the query.
	 * @type {TrackRequester}
	 */
	requester: TrackRequester;
	/**
	 * The node or the node id to make the query.
	 * @type {Node | string}
	 */
	node?: Node | string;
}

/**
 * The channel deleted data packet.
 */
export interface ChannelDelete {
	/**
	 * Guild id
	 * @type {string}
	 */
	guild_id: string;
	/**
	 * Channel id
	 * @type {string}
	 */
	id: string;
}

/**
 * The voice state packet.
 */
export interface VoiceState {
	/**
	 * The op code for the voice state.
	 * @type {string}
	 */
	op: "voiceUpdate";
	/**
	 * The guild id of the voice state.
	 * @type {string}
	 */
	guildId: string;
	/**
	 * The voice state event.
	 * @type {VoiceServer}
	 */
	event: VoiceServer;
	/**
	 * The guild id of the voice state.
	 * @type {string}
	 */
	guild_id: string;
	/**
	 * The user id of the voice state.
	 * @type {string}
	 */
	user_id: string;
	/**
	 * The session id of the voice state.
	 * @type {string}
	 */
	session_id: string;
	/**
	 * The channel id of the voice state.
	 * @type {string}
	 */
	channel_id: string;
	/**
	 * The server mute status of the voice state.
	 * @type {boolean}
	 */
	mute: boolean;
	/**
	 * The server deaf status of the voice state.
	 * @type {boolean}
	 */
	deaf: boolean;
	/**
	 * The self mute status of the voice state.
	 * @type {boolean}
	 */
	self_deaf: boolean;
	/**
	 * The self video status of the voice state.
	 * @type {boolean}
	 */
	self_mute: boolean;
	/**
	 * The self video status of the voice state.
	 * @type {boolean}
	 */
	self_video: boolean;
	/**
	 * The self stream status of the voice state.
	 * @type {boolean}
	 */
	self_stream: boolean;
	/**
	 * Whatetever the user is requesting to speak in a stage channel.
	 * @type {boolean}
	 */
	request_to_speak_timestamp: boolean;
	/**
	 * The suppress status of the voice state stage channel.
	 * @type {boolean}
	 */
	suppress: boolean;
}

/**
 * The voice server packet.
 */
export interface VoiceServer {
	/**
	 * The voice server token.
	 * @type {string}
	 */
	token: string;
	/**
	 * The voice server guild id.
	 * @type {string}
	 */
	guild_id: string;
	/**
	 * The voice server endpoint.
	 * @type {string}
	 */
	endpoint: string;
}

/**
 * The voice packet.
 */
export interface VoicePacket {
	/**
	 * The packet type.
	 * @type {string}
	 */
	t: "VOICE_SERVER_UPDATE" | "VOICE_STATE_UPDATE";
	/**
	 * The packet data.
	 * @type {VoiceState | VoiceServer}
	 */
	d: VoiceState | VoiceServer;
}

/**
 * The channel delete packet.
 */
export interface ChannelDeletePacket {
	/**
	 * The packet type
	 * @type {string}
	 */
	t: "CHANNEL_DELETE";
	/**
	 * The packet data.
	 * @type {ChannelDelete}
	 */
	d: ChannelDelete;
}

/**
 * Make a function awaitable by returning a promise or the value.
 */
export type Awaitable<T> = Promise<T> | T;

/**
 * Create a type that infers the value of a key from an object.
 */
export type Inferable<T, K extends string> = T extends { [key in K]: infer R } ? R : unknown;

/**
 * Create a type that infers the value of a key from an object.
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Create a type that can be a rest or an array.
 */
export type RestOrArray<T> = T[] | [T[]];

/**
 * Make a type required.
 */
export type PickRequired<T, K extends keyof T> = {
	[P in K]-?: T[P];
} & Omit<T, K>;

/**
 * Make a type nullable.
 */
export type PickNullable<T, K extends keyof T> = {
	[P in K]: T[P] | null;
} & Omit<T, K>;

/**
 * Make a type nullable.
 */
export type Nullable<T> = {
	[P in keyof T]: T[P] | null;
};

/**
 * Make a type required.
 */
export type DeepRequired<T> = {
	[P in keyof T]-?: T[P] extends (...args: any[]) => any
		? T[P]
		: T[P] extends any[]
			? T[P]
			: T[P] extends object
				? DeepRequired<T[P]>
				: Required<T[P]>;
};
