import { Command, Declare, type GuildCommandContext } from "seyfert";

@Declare({
    name: "autoplay",
    description: "Enable or disable autoplay.",
    aliases: ["ap", "aplay"],
    integrationTypes: ["GuildInstall"],
    contexts: ["Guild"],
})
export default class AutoplayCommand extends Command {
    override async run(ctx: GuildCommandContext) {
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

        await player.data.set("enabledAutoplay", !(await player.data.get("enabledAutoplay")));

        const autoplay = !!(await player.data.get("enabledAutoplay"));
        const type = autoplay ? "enabled" : "disabled";

        await ctx.editOrReply({ content: `Autoplay is now **${type}**.` });
    }
}
