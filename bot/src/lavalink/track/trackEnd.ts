import { EventNames, SourceNames } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events.js";

export default createLavalinkEvent({
    name: EventNames.TrackEnd,
    async run(client, player, track) {
        if (!track) return;

        if (track.info.sourceName === SourceNames.FloweryTTS) return;

        const textId = player.textId;
        if (!textId) return;

        await client.messages.write(textId, {
            content: `Finished playing: ${track.toHyperlink()}`,
        });

        const lyricsId = await player.data.get("lyricsId");
        if (lyricsId) {
            await client.messages.delete(lyricsId, textId).catch((): null => null);

            await player.data.delete("lyricsId");
            await player.data.delete("lyrics");
        }
    },
});
