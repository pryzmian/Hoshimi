import { config } from "seyfert";
import { GatewayIntentBits } from "seyfert/lib/types";

/**
 * The base directory for the bot.
 */
type BaseDirectory = "src" | "dist";

/**
 * The debug flag is used to enable debug mode.
 * @type {boolean}
 * @default false
 */
const debug: boolean = process.argv.includes("--debug");

/**
 * The dev flag is used to enable dev mode and set the base directory.
 * @type {BaseDirectory}
 * @default "dist"
 */
const base: BaseDirectory = process.argv.includes("--dev") ? "src" : "dist";

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
		base,
		events: "events",
		commands: "commands",
	},
});
