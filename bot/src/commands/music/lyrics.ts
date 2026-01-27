import { ActionRow, Button, Command, Declare, Embed, type GuildCommandContext, type Message, type WebhookMessage } from "seyfert";
import { EmbedColors } from "seyfert/lib/common/index.js";
import { ButtonStyle } from "seyfert/lib/types/index.js";
import { ms } from "../../time.js";
import { capitalize } from "../../utils.js";

@Declare({
    name: "lyrics",
    description: "Get the lyrics for the current track.",
    integrationTypes: ["GuildInstall"],
    contexts: ["Guild"],
})
export default class LyricsCommand extends Command {
    public override async run(ctx: GuildCommandContext): Promise<Message | WebhookMessage | void> {
        const { client, guildId } = ctx;

        await ctx.deferReply();

        const player = client.manager.getPlayer(guildId);
        if (!player) return ctx.editOrReply({ content: "No player found." });

        const lyrics =
            (await player.data.get("lyrics")) ??
            (await player.lyrics
                .current()
                .then(async (l) => {
                    if (!l) return null;
                    if ("error" in l && "trace" in l) return null;

                    if (typeof l.provider !== "string") l.provider = "Unknown";
                    if (typeof l.sourceName !== "string") l.sourceName = "Unknown";

                    l.provider = l.provider.replace("Source: ", "").trim();
                    l.provider = capitalize(l.provider);

                    l.sourceName = l.sourceName.replace("Source: ", "").trim();
                    l.sourceName = capitalize(l.sourceName);

                    await player.data.set("lyrics", l);

                    return l;
                })
                .catch((): null => null));

        if (!lyrics) return ctx.editOrReply({ content: "No lyrics found." });

        const current = player.queue.current;
        if (!current) return ctx.editOrReply({ content: "No track is currently playing." });

        const { provider, sourceName, lines } = lyrics;

        const text = lines
            .map((line) => {
                if (!line.line.length) line.line = "...";
                return line.line;
            })
            .join("\n");

        const embed = new Embed()
            .setTitle(`Lyrics for: ${current.info.title ?? "Unknown"}`)
            .setThumbnail(current.info.artworkUrl ?? undefined)
            .setDescription(
                `**Source:** ${sourceName}\n**Provider:** ${provider}\n\n${text.length > 4050 ? `${text.slice(0, 4050)}...` : text}`,
            )
            .setFooter({ text: `Lines: ${lines.length}` })
            .setColor(EmbedColors.White);

        const row = new ActionRow().addComponents(
            new Button().setCustomId("lyrics-live").setLabel("Live Lyrics").setStyle(ButtonStyle.Secondary),
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
            const isEnabled = !!(await player.data.get("enabledLyrics"));
            if (!isEnabled) await player.lyrics.subscribe();

            const text = lines
                .map((line) => `-# ${line.line}`)
                .slice(0, 11)
                .join("\n");

            embed
                .setDescription(`**Source:** ${sourceName}\n**Provider:** ${provider}\n\n${text}`)
                .setFooter({ text: `Lines: 0 / ${lyrics.lines.length}` });

            await player.data.set("lyricsId", message.id);
            await player.data.set("enabledLyrics", true);

            await interaction
                .update({
                    content: "",
                    embeds: [embed],
                    components: [],
                })
                .catch((): null => null);
        });
    }
}
