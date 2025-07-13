import { Events } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events";

export default createLavalinkEvent({
	name: Events.QueueEnd,
	async run(client, player, _queue) {
		const textId = player.textId;
		if (!textId) return;

		await client.messages.write(textId, { content: "Queue has ended." });
	},
});
