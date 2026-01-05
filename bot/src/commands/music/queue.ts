import { Command, Declare, Embed, type GuildCommandContext } from "seyfert";
import { EmbedColors } from "seyfert/lib/common/index.js";

@Declare({
    name: "queue",
    description: "Show the current music queue.",
    aliases: ["q"],
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

        if (bot && bot.channelId !== state.channelId) return ctx.editOrReply({ content: "I'm already in a voice channel." });

        const player = client.manager.getPlayer(ctx.guildId);
        if (!player) return ctx.editOrReply({ content: "No player found." });

        const queue = player.queue;

        if (queue.isEmpty()) return ctx.editOrReply({ content: "The queue is empty." });

        const tracks = queue.tracks
            .slice(0, 10)
            .map((track, index) => `${index + 1}. ${track.info.title} - ${track.requester ? `<@${track.requester.id}>` : "Unknown"}`)
            .join("\n");
        const current = `**Now Playing:** ${queue.current!.info.title} - ${queue.current!.requester ? `<@${queue.current!.requester.id}>` : "Unknown"}`;

        const embed = new Embed()
            .setTitle("Music Queue")
            .setDescription(`${current}\n\n**Up Next:**\n${tracks}`)
            .setColor(EmbedColors.Blue);

        await ctx.editOrReply({ embeds: [embed] });
    }
}
