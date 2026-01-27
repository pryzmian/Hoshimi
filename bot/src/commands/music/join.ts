import { Command, Declare, type GuildCommandContext } from "seyfert";

@Declare({
    name: "join",
    description: "Join the bot into a voice channel.",
    aliases: ["j"],
    integrationTypes: ["GuildInstall"],
    contexts: ["Guild"],
})
export default class JoinCommand extends Command {
    override async run(ctx: GuildCommandContext) {
        const { client } = ctx;

        if (!client.manager.isUseable())
            return ctx.editOrReply({
                content: "The bot is not connected to any node. For now is not useable.",
            });

        const state = await ctx.member.voice().catch((): null => null);
        if (!state?.channelId)
            return ctx.editOrReply({
                content: "You need to be in a voice channel to use this command.",
            });

        const me = await ctx.me();

        const bot = await me.voice().catch((): null => null);
        if (bot && bot.channelId !== state.channelId) return ctx.editOrReply({ content: "I'm already in a voice channel." });

        const player = client.manager.createPlayer({
            guildId: ctx.guildId,
            voiceId: state.channelId,
            textId: ctx.channelId,
            volume: 100,
            selfDeaf: true,
        });

        if (!player.connected) await player.connect();

        await ctx.editOrReply({
            content: `Joined <#${state.channelId}> successfully!`,
        });
    }
}
