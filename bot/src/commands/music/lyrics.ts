import {
	Command,
	Declare,
	type Message,
	type WebhookMessage,
	type GuildCommandContext,
	Embed,
	ActionRow,
	Button,
} from "seyfert";
import { EmbedColors } from "seyfert/lib/common";
import { ButtonStyle } from "seyfert/lib/types";
import { ms } from "../../time";

@Declare({
	name: "lyrics",
	description: "Get the lyrics for the current track.",
	integrationTypes: ["GuildInstall"],
	contexts: ["Guild"],
})
export default class LyricsCommand extends Command {
	public override async run(ctx: GuildCommandContext): Promise<Message | WebhookMessage | void> {
		const { client, guildId } = ctx;

		const player = client.manager.getPlayer(guildId);
		if (!player) return ctx.editOrReply({ content: "No player found." });

		const lyrics = await player.lyrics.current();
		if (!lyrics) return ctx.editOrReply({ content: "No lyrics found." });

		player.data.set("lyrics", lyrics);

		const current = player.queue.current;
		if (!current) return ctx.editOrReply({ content: "No track is currently playing." });

		const { provider, sourceName, lines } = lyrics;

		const text = lines.map((line) => line.line).join("\n");

		const embed = new Embed()
			.setTitle(`Lyrics for: ${current.info.title ?? "Unknown"}`)
			.setDescription(
				`**Source:** ${sourceName}\n**Provider:** ${provider}\n\n${text.length > 4050 ? `${text.slice(0, 4050)}...` : text}`,
			)
			.setFooter({ text: `Lines: ${lines.length}` })
			.setColor(EmbedColors.White);

		const row = new ActionRow().addComponents(
			new Button()
				.setCustomId("lyrics-live")
				.setLabel("Live Lyrics")
				.setStyle(ButtonStyle.Secondary),
		);

		const message = await ctx.editOrReply({ embeds: [embed], components: [row] }, true);
		const collector = message.createComponentCollector({
			filter: (i) => i.user.id === ctx.author.id,
			idle: ms("1min"),
			async onPass(interaction) {
				await interaction.editOrReply({ content: "This is not your message." });
			},
		});

		collector.run("lyrics-live", async (interaction) => {
			await interaction.update({ components: [] });
			await player.lyrics.subscribe();

			player.data.set("lyricsId", message.id);
			player.data.set("enabledLyrics", true);
		});
	}
}
