import { SourceNames, Events } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events";

export default createLavalinkEvent({
	name: Events.TrackEnd,
	async run(client, player, track, _payload) {
		if (!track) return;

		if (track.info.sourceName === SourceNames.FloweryTTS) return;

		const textId = player.textId;
		if (!textId) return;

		await client.messages.write(textId, {
			content: `Finished playing: ${track.toHyperlink()}`,
		});
	},
});
