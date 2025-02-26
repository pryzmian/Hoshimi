import { config } from "seyfert";

export default config.bot({
	token: process.env.TOKEN ?? "The knave",
	debug: true,
	intents: ["Guilds", "MessageContent", "GuildMessages", "GuildVoiceStates", "GuildMembers"],
	locations: {
		base: "src",
		events: "events",
		commands: "commands",
	},
});
