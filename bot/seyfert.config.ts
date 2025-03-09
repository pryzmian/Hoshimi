import { config } from "seyfert";
import { GatewayIntentBits } from "seyfert/lib/types";

const debug = process.argv.includes("--debug");

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
	},
});
