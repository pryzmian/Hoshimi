import { EventNames } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events.js";

export default createLavalinkEvent({
    name: EventNames.LyricsLine,
    async run(client, player, _$1, payload) {
        if (payload.skipped) return;

        if (!(await player.data.has("enabledLyrics"))) return;
        if (!player.textId) return;

        const lyricsId = await player.data.get("lyricsId");
        if (!lyricsId) return;

        const message = await client.messages.fetch(lyricsId, player.textId).catch((): null => null);
        if (!message) return;

        const lyrics = await player.data.get("lyrics");
        if (!lyrics) {
            await message.delete().catch((): null => null);

            await player.data.delete("lyricsId");
            await player.data.delete("lyrics");

            return;
        }

        const embed = message.embeds.at(0)?.toBuilder();
        if (!embed) return;

        const totalLines = 11;
        const index = payload.lineIndex;

        let start = Math.max(0, index - Math.floor(totalLines / 2));
        if (start + totalLines > lyrics.lines.length) start = Math.max(0, lyrics.lines.length - totalLines);

        const end = Math.min(lyrics.lines.length, start + totalLines);

        const lines: string = lyrics.lines
            .slice(start, end)
            .map((l, i): string => {
                if (!l.line.length) l.line = "...";
                return i + start === index ? `**${l.line}**` : `-# ${l.line}`;
            })
            .join("\n");

        const { provider, sourceName } = lyrics;

        embed
            .setDescription(`**Source:** ${sourceName}\n**Provider:** ${provider}\n\n${lines}`)
            .setFooter({ text: `Lines: ${index + 1} / ${lyrics.lines.length}` });

        await message.edit({ embeds: [embed] }).catch((): null => null);
    },
});
