import { Command, createStringOption, Declare, Options, type GuildCommandContext } from "seyfert";
import { SearchEngines } from "hoshimi";
import { omitKeys } from "../../utils";

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
                ...omitKeys(ctx.author, ["client"]),
                global_name: ctx.author.username,
                tag: ctx.author.tag,
            },
        });

        if (!player.connected) await player.connect();

        await player.play({ track: tracks[0] });
        await ctx.editOrReply({
            content: `${ctx.author.toString()}: ${options.text}`,
        });
    }
}
