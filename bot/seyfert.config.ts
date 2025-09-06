import { config } from "seyfert";
import { GatewayIntentBits } from "seyfert/lib/types";

/**
 * The debug flag is used to enable debug mode.
 * @type {boolean}
 * @default false
 */
const debug: boolean = process.argv.includes("--debug");

/**
 * The Seyfert configuration for the bot.
 */
export default config.bot({
    debug,
    token: process.env.TOKEN ?? "The knave",
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
    ],
    locations: {
        base: "src",
        events: "events",
        commands: "commands",
        lavalink: "lavalink",
    },
});
