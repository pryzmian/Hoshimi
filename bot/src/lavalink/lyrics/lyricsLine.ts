import { Events } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events";

export default createLavalinkEvent({
	name: Events.LyricsLine,
	async run(client, player, track, payload) {
		client.logger.info({ player, track, payload });
	},
});
