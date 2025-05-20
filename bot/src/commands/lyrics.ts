import {
	Command,
	Declare,
	type Message,
	type WebhookMessage,
	type GuildCommandContext,
	Embed,
} from "seyfert";
import { EmbedColors } from "seyfert/lib/common";

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

		const { provider, sourceName, lines } = lyrics;

		const text = lines.map((line) => line.line).join("\n");

		const embed = new Embed()
			.setTitle("Lyrics")
			.setDescription(
				`**Source:** ${sourceName}\n**Provider:** ${provider}\n\n${text.length > 4050 ? `${text.slice(0, 4050)}...` : text}`,
			)
			.setFooter({ text: `Lines: ${lines.length}` })
			.setColor(EmbedColors.White);

		await ctx.editOrReply({ embeds: [embed] });
	}
}
