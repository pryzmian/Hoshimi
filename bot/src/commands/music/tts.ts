import { SearchEngines } from "hoshimi";
import { Command, createStringOption, Declare, type GuildCommandContext, Options } from "seyfert";

const options = {
    text: createStringOption({
        description: "The text to say.",
        required: true,
    }),
    voice: createStringOption({
        description: "The voice to use.",
    }),
};

@Declare({
    name: "tts",
    description: "Speak with the bot.",
    aliases: ["say"],
    integrationTypes: ["GuildInstall"],
    contexts: ["Guild"],
})
@Options(options)
export default class TtsCommand extends Command {
    override async run(ctx: GuildCommandContext<typeof options>) {
        const { client, options } = ctx;

        const state = await ctx.member.voice().catch(() => null);
        if (!state?.channelId)
            return ctx.editOrReply({
                content: "You need to be in a voice channel to use this command.",
            });

        const me = await ctx.me();

        const bot = await me.voice().catch(() => null);
        if (bot && bot.channelId !== state.channelId)
            return ctx.editOrReply({
                content: "I'm already in a voice channel.",
            });

        const player = client.manager.createPlayer({
            guildId: ctx.guildId,
            voiceId: state.channelId,
            textId: ctx.channelId,
        });

        const { tracks } = await player.search({
            query: options.text,
            engine: SearchEngines.FloweryTTS,
            params: {
                voice: options.voice ?? "Andrea",
            },
            requester: {
                id: ctx.author.id,
                tag: ctx.author.tag,
                username: ctx.author.username,
            },
        });

        if (!player.connected) await player.connect();

        await player.play({ track: tracks[0] });
        await ctx.editOrReply({
            content: `${ctx.author.toString()}: ${options.text}`,
        });
    }
}
