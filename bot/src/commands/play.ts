import { Command, createStringOption, Declare, Options, type GuildCommandContext } from "seyfert";
import { LoadType } from "hoshimi";
import { omitKeys } from "../utils";

const options = {
	query: createStringOption({
		description: "The song to play.",
		required: true,
	}),
};

@Declare({
	name: "play",
	description: "Play a song.",
})
@Options(options)
export default class PlayCommand extends Command {
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

		const { loadType, tracks, playlist } = await player.search({
			query: options.query,
			requester: {
				...omitKeys(ctx.author, ["client"]),
				global_name: ctx.author.username,
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
					if (!track)
						return ctx.editOrReply({
							content: "No tracks were found.",
						});

					player.queue.add(track);

					if (!player.playing) await player.play();

					await ctx.editOrReply({
						content: `Added ${track.toHyperlink()} to the queue.`,
					});

					player.set("enabledAutoplay", true);
				}
				break;

			case LoadType.Playlist:
				{
					if (!playlist)
						return ctx.editOrReply({
							content: "No tracks were found.",
						});

					player.queue.add(tracks);

					await player.play({ noReplace: true });
					await ctx.editOrReply({
						content: `Added ${tracks.length} tracks to the queue. (${playlist.info.name})`,
					});
				}
				break;
		}
	}
}
