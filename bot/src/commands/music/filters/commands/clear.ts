import { Declare, type GuildCommandContext, SubCommand } from "seyfert";

@Declare({
    name: "clear",
    description: "Clear a music filter.",
})
export default class ClearFilterSubcommand extends SubCommand {
    public override async run(ctx: GuildCommandContext) {
        const { client } = ctx;

        const state = await ctx.member.voice();
        if (!state.channelId)
            return ctx.editOrReply({
                content: "You need to be in a voice channel to use this command.",
            });

        const me = await ctx.me();
        const bot = await me.voice();

        if (bot && bot.channelId !== state.channelId) return ctx.editOrReply({ content: "I'm already in a voice channel." });

        const player = client.manager.getPlayer(ctx.guildId);
        if (!player) return ctx.editOrReply({ content: "No player found." });

        await player.filterManager.reset();

        return ctx.editOrReply({
            content: "Cleared all filters.",
        });
    }
}
