import { config } from "seyfert";
import { GatewayIntentBits } from "seyfert/lib/types/index.js";
import { Constants } from "./src/constants.js";

/**
 * The Seyfert configuration for the bot.
 */
export default config.bot({
    debug: Constants.Debug,
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
