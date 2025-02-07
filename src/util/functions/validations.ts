import type { NodeOptions, SearchQuery } from "../../types/Node";
import { SearchEngines, type HoshimiOptions } from "../../types/Manager";
import { OptionError } from "../../classes/Errors";
import type { Node } from "../../classes/node/Node";
import type { PlayerOptions } from "../../types/Player";
import type { UpdatePlayerInfo } from "../../types/Rest";

const validEngines = Object.values(SearchEngines);
const validUrl = /^(https?:\/\/)?([a-zA-Z0-9\-_]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;

/**
 *
 * Validate the manager options.
 * @param options The options to validate.
 */
export function validateManagerOptions(options: HoshimiOptions) {
	if (!Array.isArray(options.nodes) || !options.nodes.every(isNode) || !options.nodes.length)
		throw new OptionError(
			"The manager option 'options.nodes' must be a valid array of nodes and atleast one valid node.",
		);
	if (typeof options.sendPayload !== "function")
		throw new OptionError("The manager option 'options.sendPayload' must be a vaid function.");

	if (
		typeof options.queueOptions !== "undefined" &&
		typeof options.queueOptions.maxPreviousTracks !== "number"
	)
		throw new OptionError(
			"The manager option 'options.queue.maxPreviousTracks' must be a number.",
		);
	if (
		typeof options.queueOptions !== "undefined" &&
		typeof options.queueOptions.autoplayFn !== "function"
	)
		throw new OptionError("The manager option 'options.queue.autoplayFn' must be a function.");

	if (
		typeof options.defaultSearchEngine !== "undefined" &&
		!validEngines.includes(options.defaultSearchEngine)
	)
		throw new OptionError(
			"The manager option 'options.defaultSearchEngine' Must be a valid search engine.",
		);
	if (typeof options.client !== "undefined" && typeof options.client !== "object")
		throw new OptionError("The manager option 'options.client' Must be a valid object.");
	if (typeof options.client !== "undefined" && typeof options.client.id !== "string")
		throw new OptionError("The manager option 'options.client.id' Must be a valid string.");
	if (typeof options.client !== "undefined" && typeof options.client.username !== "string")
		throw new OptionError(
			"The manager option 'options.client.username' must be a valid string.",
		);
}

/**
 *
 * Validate the query for the node.
 * @param this The node to validate the query for.
 * @param search The query to validate.
 * @returns
 */
export function validateQuery(search: SearchQuery): string {
	if (typeof search !== "object") throw new OptionError("The 'query' must be a valid object.");
	if (typeof search.query !== "string")
		throw new OptionError("The query option 'query.query' must be a valid string.");

	if (typeof search.engine !== "undefined" && !validEngines.includes(search.engine))
		throw new OptionError("The query option 'query.engine' must be a valid search engine.");

	const query = search.query.trim().toLowerCase();
	const engineKey = Object.values(SearchEngines).find((key) => query.startsWith(key));
	if (engineKey && query.startsWith(`${engineKey.toLowerCase()}:`)) {
		const sliced = query.slice(engineKey.length + 1).trim();
		const isUrl = validUrl.test(sliced);

		if (isUrl) return sliced;

		return `${engineKey}:${encodeURIComponent(sliced)}`;
	}

	const isUrl = validUrl.test(query);
	if (isUrl) return query;

	if (search.engine === SearchEngines.FloweryTTS)
		return `${search.engine}://${encodeURIComponent(query)}`;
	if (search.engine !== SearchEngines.Local)
		return `${search.engine}:${encodeURIComponent(query)}`;

	return query;
}

/**
 *
 * Validate the player options.
 * @param options The player options.
 */
export function validatePlayerOptions(options: PlayerOptions): void {
	if (typeof options.guildId !== "string")
		throw new OptionError("The player option 'options.guildId' must be a string.");
	if (typeof options.voiceId !== "string")
		throw new OptionError("The player option 'options.voiceId' Must be a string.");
	if (typeof options.textId !== "undefined" && typeof options.textId !== "string")
		throw new OptionError("The player option 'options.textId' Must be a string.");

	if (typeof options.selfDeaf !== "undefined" && typeof options.selfDeaf !== "boolean")
		throw new OptionError("The player option 'options.selfDeaf' Must be a boolean.");
	if (typeof options.selfMute !== "undefined" && typeof options.selfMute !== "boolean")
		throw new OptionError("The player option 'options.selfMute' Mute must be a boolean.");
	if (typeof options.volume !== "undefined" && typeof options.volume !== "number")
		throw new OptionError("The player option 'options.volume' Must be a number.");
}

/**
 *
 * Validate the player data.
 * @param this The node to validate the player data for.
 * @param data The data to validate.
 * @param res The lavalink player to validate.
 * @returns
 */
export function validatePlayerData(this: Node, data: Partial<UpdatePlayerInfo>): void {
	if (
		typeof data === "object" &&
		typeof data.playerOptions === "object" &&
		typeof data.guildId === "string" &&
		Object.keys(data.playerOptions).length > 0
	) {
		const player = this.manager.getPlayer(data.guildId);
		if (!player) return;

		if (typeof data.playerOptions.voice === "object") player.voice = data.playerOptions.voice;

		if (typeof data.playerOptions.paused === "boolean") {
			player.paused = data.playerOptions.paused;
			player.playing = !data.playerOptions.paused;
		}

		if (typeof data.playerOptions.volume === "number")
			player.volume = data.playerOptions.volume;
	}
}

/**
 *
 * Validate if the node options are correct.
 * @param options The node options to validate.
 * @returns
 */
function isNode(options: NodeOptions) {
	return (
		typeof options.host === "string" &&
		typeof options.port === "number" &&
		typeof options.password === "string" &&
		(typeof options.id === "string" || typeof options.id === "undefined") &&
		(typeof options.secure === "boolean" || typeof options.secure === "undefined") &&
		(typeof options.sessionId === "string" || typeof options.sessionId === "undefined") &&
		(typeof options.retryAmount === "number" || typeof options.retryAmount === "undefined") &&
		(typeof options.retryDelay === "number" || typeof options.retryDelay === "undefined")
	);
}
