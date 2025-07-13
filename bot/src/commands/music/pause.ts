import { Command, Declare, type GuildCommandContext } from "seyfert";

@Declare({
	name: "pause",
	description: "Pause or resume the current track.",
	aliases: ["p"],
	integrationTypes: ["GuildInstall"],
	contexts: ["Guild"],
})
export default class PauseCommand extends Command {
	override async run(ctx: GuildCommandContext) {
		const { client } = ctx;

		const state = await ctx.member.voice();
		if (!state.channelId)
			return ctx.editOrReply({
				content: "You need to be in a voice channel to use this command.",
			});

		const me = await ctx.me();
		const bot = await me.voice();

		if (bot && bot.channelId !== state.channelId)
			return ctx.editOrReply({ content: "I'm already in a voice channel." });

		const player = client.manager.getPlayer(ctx.guildId);
		if (!player) return ctx.editOrReply({ content: "No player found." });

		const status = await player.setPaused();
		const type = status ? "Paused" : "Resumed";

		await ctx.editOrReply({ content: `${type} the current track.` });
	}
}
