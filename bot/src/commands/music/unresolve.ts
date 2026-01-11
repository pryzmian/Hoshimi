import { UnresolvedTrack } from "hoshimi";
import { Command, createStringOption, Declare, type GuildCommandContext, type Message, Options, type WebhookMessage } from "seyfert";

const options = {
    title: createStringOption({
        description: "The track title to resolve the track.",
        required: true,
    }),
    uri: createStringOption({
        description: "The URL of the track to resolve.",
    }),
    author: createStringOption({
        description: "The author of the track to resolve.",
    }),
};

@Declare({
    name: "unresolve",
    description: "Resolves a track using partial data.",
    contexts: ["Guild"],
    integrationTypes: ["GuildInstall"],
})
@Options(options)
export default class UnresolveCommand extends Command {
    public override async run(ctx: GuildCommandContext<typeof options>): Promise<Message | WebhookMessage | void> {
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

        const { title, uri, author } = ctx.options;

        const unresolved = new UnresolvedTrack(
            { info: { title, uri, author } },
            {
                id: ctx.author.id,
                tag: ctx.author.tag,
                username: ctx.author.username,
            },
        );

        player.queue.add(unresolved);

        if (!player.isPlaying()) await player.play();

        return ctx.editOrReply({
            content: `The unresolved track **${unresolved.info.title}** has been added to the queue.`,
        });
    }
}
