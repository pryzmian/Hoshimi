import "dotenv/config";

import { Client, type ParseClient } from "seyfert";
import { DebugLevels, Hoshimi, Events, SourceNames, SearchEngines } from "hoshimi";
import type { APIUser } from "seyfert/lib/types";
import { HandleCommand } from "seyfert/lib/commands/handle";
import { Yuna } from "yunaforseyfert";
import { TimeFormat } from "./time";

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
	defaultSearchEngine: SearchEngines.Youtube,
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

client.setServices({
	handleCommand: class extends HandleCommand {
		override argsParser = Yuna.parser({
			syntax: {
				namedOptions: ["-", "--"],
			},
		});
	},
});

client.manager.on(Events.NodeReady, (node) => client.logger.info(`Node ${node.id} is ready.`));

client.manager.on(Events.NodeDestroy, (node, destroy) =>
	client.logger.warn(
		`Node ${node.id} is destroyed with the reason ${destroy.reason} (${destroy.code}).`,
	),
);

client.manager.on(Events.NodeError, (node, error) =>
	client.logger.error(`Node ${node.id} emitted an error: ${error}`),
);

client.manager.on(Events.NodeDisconnect, (node) =>
	client.logger.error(`Node ${node.id} disconnected.`),
);

client.manager.on(Events.NodeReconnecting, (node, retriesLeft, delay) =>
	client.logger.warn(
		`Node ${node.id} is reconnecting with ${retriesLeft} retries left in ${TimeFormat.toHumanize(delay)}...`,
	),
);

client.manager.on(Events.Debug, async (level, message) => {
	const isDebug = await client.getRC().then((rc) => rc.debug);
	if (isDebug) client.logger.debug(`[Hoshimi] ${DebugLevels[level]}: ${message}`);
});

client.manager.on(Events.TrackStart, async (player, track) => {
	if (!track) return;

	if (track.info.sourceName === SourceNames.FloweryTTS) return;

	const textId = player.textId;
	if (!textId) return;

	await client.messages.write(textId, { content: `Now playing: ${track.toHyperlink()}` });
});

client.manager.on(Events.TrackEnd, async (player, track) => {
	if (!track) return;

	if (track.info.sourceName === SourceNames.FloweryTTS) return;

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
