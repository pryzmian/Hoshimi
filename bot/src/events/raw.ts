import type { ChannelDeletePacket, VoicePacket, VoiceServer, VoiceState } from "hoshimi";
import { createEvent } from "seyfert";

type AnyPacket = VoicePacket | VoiceServer | VoiceState | ChannelDeletePacket;

export default createEvent({
    data: { name: "raw" },
    async run(data, client): Promise<void> {
        await client.manager.updateVoiceState(data as AnyPacket);
    },
});
