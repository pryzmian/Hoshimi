import { EventNames, SourceNames } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events.js";
import { TimeFormat } from "../../time.js";

export default createLavalinkEvent({
    name: EventNames.TrackStart,
    async run(client, player, track) {
        if (!track) return;

        if (track.info.sourceName === SourceNames.FloweryTTS) return;

        const textId = player.textId;
        if (!textId) return;

        await client.messages.write(textId, {
            content: `Now playing: ${track.toHyperlink()} (${TimeFormat.toHumanize(track.info.length)})\nBy: ${track.requester.tag}`,
        });
    },
});
