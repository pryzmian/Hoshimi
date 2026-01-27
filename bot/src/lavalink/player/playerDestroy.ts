import { EventNames } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events.js";
import { Sessions } from "../../manager/sessions.js";

export default createLavalinkEvent({
    name: EventNames.PlayerDestroy,
    async run(client, player): Promise<void> {
        Sessions.delete(player.guildId);

        if (!player.textId) return;

        const lyricsId: string | undefined = await player.data.get("lyricsId");
        if (lyricsId) {
            await client.messages.delete(lyricsId, player.textId).catch((): null => null);

            await player.data.delete("lyricsId");
            await player.data.delete("lyrics");
            await player.data.delete("enabledLyrics");
        }
    },
});
