import { Events } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events.js";

export default createLavalinkEvent({
    name: Events.QueueEnd,
    async run(client, player) {
        const textId = player.textId;
        if (!textId) return;

        await client.messages.write(textId, { content: "Queue has ended." });

        const lyricsId = await player.data.get("lyricsId");
        if (lyricsId) {
            const isEnabled = !!(await player.data.get("enabledLyrics"));
            if (isEnabled) await player.lyrics.unsubscribe();

            await client.messages.delete(lyricsId, textId).catch(() => null);

            player.data.delete("lyricsId");
            player.data.delete("lyrics");
            player.data.delete("enabledLyrics");
        }
    },
});
