import "dotenv/config";

import { Client, type ParseClient } from "seyfert";
import { DebugLevels, Hoshimi, Events } from "hoshimi";
import type { APIUser } from "seyfert/lib/types";

type HoshimiUser = APIUser & {
	tag: string;
};

const client = new Client({
	allowedMentions: {
		parse: ["roles", "users"],
		replied_user: false,
	},
	commands: {
		prefix: () => ["hoshimi"],
		reply: () => true,
	},
});

client.manager = new Hoshimi({
	sendPayload: (guildId, payload) =>
		client.gateway.send(client.gateway.calculateShardId(guildId), payload),
	nodes: [
		{
			host: "localhost",
			port: 2333,
			password: "ganyuontopuwu",
		},
	],
});

client.manager.on(Events.Debug, (level, message) =>
	console.log(`[Hoshimi] ${DebugLevels[level]}: ${message}`),
);
client.manager.on(Events.TrackStart, async (player, track) => {
	if (!track) return;

	const textId = player.textId;
	if (!textId) return;

	await client.messages.write(textId, { content: `Now playing: ${track.toHyperlink()}` });
});

client.manager.on(Events.TrackEnd, async (player, track) => {
	if (!track) return;

	const textId = player.textId;
	if (!textId) return;

	await client.messages.write(textId, { content: `Finished playing: ${track.toHyperlink()}` });
});

client.manager.on(Events.QueueEnd, async (player) => {
	const textId = player.textId;
	if (!textId) return;

	await client.messages.write(textId, { content: "Queue has ended." });
});

(async () => {
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
}
