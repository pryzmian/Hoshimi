import { createEvent } from "seyfert";
import type { VoicePacket, VoiceServer, VoiceState, ChannelDeletePacket } from "hoshimi";

type AnyPacket = VoicePacket | VoiceServer | VoiceState | ChannelDeletePacket;

export default createEvent({
	data: { name: "raw" },
	async run(data, client) {
		await client.manager.sendRaw(data as AnyPacket);
	},
});
