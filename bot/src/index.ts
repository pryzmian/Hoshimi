import "dotenv/config";

import { Client, type ParseClient, type UsingClient } from "seyfert";
import { Hoshimi, Events, SearchEngines, type LyricsResult } from "hoshimi";
import type { APIUser } from "seyfert/lib/types";
import { HandleCommand } from "seyfert/lib/commands/handle";
import { Yuna } from "yunaforseyfert";

import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { trackStart } from "./lavalink/track/trackStart";
import { trackEnd } from "./lavalink/track/trackEnd";

import { queueEnd } from "./lavalink/queue/queueEnd";

import { nodeReady } from "./lavalink/node/nodeReady";
import { nodeDestroy } from "./lavalink/node/nodeDestroy,";
import { nodeError } from "./lavalink/node/nodeError";
import { nodeDisconnect } from "./lavalink/node/nodeDisconnect";
import { nodeReconnecting } from "./lavalink/node/nodeReconnecting";

import { lyricsLine } from "./lavalink/lyrics/lyricsLine";

import { debug } from "./lavalink/debug";

const path = resolve(process.cwd(), "cache");

type HoshimiUser = APIUser & {
	tag: string;
};

const client = new Client({
	allowedMentions: {
		parse: ["roles", "users"],
		replied_user: false,
	},
	commands: {
		prefix: () => ["hoshimi", "h."],
		reply: () => true,
	},
}) as UsingClient;

client.manager = new Hoshimi({
	sendPayload: (guildId, payload) =>
		client.gateway.send(client.gateway.calculateShardId(guildId), payload),
	defaultSearchEngine: SearchEngines.Spotify,
	nodes: [
		{
			host: "localhost",
			port: 2333,
			password: "ganyuontopuwu",
		},
	],
});

client.setServices({
	handleCommand: class extends HandleCommand {
		override argsParser = Yuna.parser({
			syntax: {
				namedOptions: ["-", "--"],
			},
		});
	},
});

client.manager.on(Events.NodeReady, (node) => nodeReady(client, node));
client.manager.on(Events.NodeDestroy, (node, destroy) => nodeDestroy(client, node, destroy));
client.manager.on(Events.NodeError, (node, error) => nodeError(client, node, error));
client.manager.on(Events.NodeDisconnect, (node) => nodeDisconnect(client, node));
client.manager.on(Events.NodeReconnecting, (node, retriesLeft, delay) =>
	nodeReconnecting(client, node, retriesLeft, delay),
);
client.manager.on(Events.Debug, (level, message) => debug(client, level, message));
client.manager.on(Events.TrackStart, (player, track) => trackStart(client, track, player));
client.manager.on(Events.TrackEnd, (player, track) => trackEnd(client, track, player));
client.manager.on(Events.QueueEnd, (player) => queueEnd(client, player));
client.manager.on(Events.LyricsLine, (player, track, payload) =>
	lyricsLine(client, player, track, payload),
);

(async (): Promise<void> => {
	await mkdir(path, { recursive: true });
	await client.start();
})();

declare module "seyfert" {
	interface UsingClient extends ParseClient<Client<true>> {}

	interface InternalOptions {
		withPrefix: true;
	}

	interface Client {
		manager: Hoshimi;
	}
}

declare module "hoshimi" {
	interface CustomizableTrack {
		requester: HoshimiUser;
	}

	interface CustomizablePlayerStorage {
		enabledAutoplay: boolean;
		enabledLyrics: boolean;
		lyricsId: string;
		lyrics: LyricsResult;
	}
}
