import { LoadType } from "hoshimi";
import { Command, createStringOption, Declare, type GuildCommandContext, Options } from "seyfert";
import { TimeFormat } from "../../time.js";

const options = {
    query: createStringOption({
        description: "The song to play.",
        required: true,
    }),
};

@Declare({
    name: "play",
    description: "Play a song.",
    aliases: ["p"],
    integrationTypes: ["GuildInstall"],
    contexts: ["Guild"],
})
@Options(options)
export default class PlayCommand extends Command {
    override async run(ctx: GuildCommandContext<typeof options>) {
        const { client, options } = ctx;

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

        const { loadType, tracks, playlist } = await player.search({
            query: options.query,
            requester: {
                id: ctx.author.id,
                username: ctx.author.username,
                tag: ctx.author.tag,
            },
        });

        if (!player.connected) await player.connect();

        switch (loadType) {
            case LoadType.Empty:
            case LoadType.Error:
                {
                    await ctx.editOrReply({
                        content: "No tracks were found.",
                    });
                }
                break;

            case LoadType.Track:
            case LoadType.Search:
                {
                    const track = tracks[0];

                    player.queue.add(track);

                    if (!player.playing) await player.play();

                    await ctx.editOrReply({
                        content: `Added ${track.toHyperlink(false)} (${TimeFormat.toHumanize(track.info.length)}) to the queue.`,
                    });
                }
                break;

            case LoadType.Playlist:
                {
                    if (!playlist)
                        return ctx.editOrReply({
                            content: "No tracks were found.",
                        });

                    player.queue.add(tracks);

                    if (!player.isPlaying()) await player.play();

                    await ctx.editOrReply({
                        content: `Added ${tracks.length} tracks to the queue. (${playlist.info.name})`,
                    });
                }
                break;
        }
    }
}
