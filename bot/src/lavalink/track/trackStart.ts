import { SourceNames, Events } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events";
import { TimeFormat } from "../../time";

export default createLavalinkEvent({
    name: Events.TrackStart,
    async run(client, player, track, _payload) {
        if (!track) return;

        if (track.info.sourceName === SourceNames.FloweryTTS) return;

        const textId = player.textId;
        if (!textId) return;

        await client.messages.write(textId, {
            content: `Now playing: ${track.toHyperlink()} (${TimeFormat.toHumanize(track.info.length)}), By: ${track.requester.tag}`,
        });
    },
});
