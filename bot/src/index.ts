import "dotenv/config";

import { Client, type ParseClient, type UsingClient } from "seyfert";
import { Hoshimi, Player, SearchEngines, Structures, type LyricsResult } from "hoshimi";
import { HandleCommand } from "seyfert/lib/commands/handle";
import { Yuna } from "yunaforseyfert";
import { LavalinkHandler } from "./manager/handler";
import type { HoshimiUser } from "./manager/types";

import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { autoplayFn } from "./autoplay";

const path = resolve(process.cwd(), "cache");

const client = new Client({
    allowedMentions: {
        parse: ["roles", "users"],
        replied_user: false,
    },
    commands: {
        prefix: () => ["hoshimi", "h."],
        reply: () => true,
        deferReplyResponse: ({ client }) => ({
            content: `**${client.me.username}** is thinking...`,
        }),
    },
}) as Client<true> & UsingClient;

client.manager = new Hoshimi({
    sendPayload: (guildId, payload) => client.gateway.send(client.gateway.calculateShardId(guildId), payload),
    defaultSearchEngine: SearchEngines.Spotify,
    nodeOptions: {
        resumable: false,
        resumeByLibrary: false,
    },
    queueOptions: {
        autoplayFn,
    },
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

// Extend the player with whatever you want
class HoshimiPlayer extends Player {
    textChannelId: string | null = null;
}

// Override the player structure.
Structures.Player = (...args) => new HoshimiPlayer(...args);

const handler = new LavalinkHandler(client);

(async (): Promise<void> => {
    await mkdir(path, { recursive: true });
    await handler.load();
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

    interface ExtendedRCLocations {
        lavalink: string;
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

    interface CustomizableStructures {
        Player: HoshimiPlayer;
    }
}
