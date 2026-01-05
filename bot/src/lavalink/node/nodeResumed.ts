import { Events } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events";
import { Sessions } from "../../manager/sessions";
import type { SessionJson } from "../../manager/types";

export default createLavalinkEvent({
    name: Events.NodeResumed,
    async run(client, node, players, payload) {
        client.logger.debug(`[Hoshimi] Node resumed: ${node.id} with ${players.length} players. | Payload: ${JSON.stringify(payload)}`);

        for (const data of players) {
            const session: SessionJson | undefined = Sessions.get<SessionJson>(data.guildId);
            if (!session) continue;

            if (!data.state.connected) {
                Sessions.delete(data.guildId);
                continue;
            }

            const player = client.manager.createPlayer({
                guildId: data.guildId,
                voiceId: session.voiceId!,
                textId: session.textId!,
                node: node.id,
                selfDeaf: true,
                selfMute: false,
                volume: data.volume,
            });

            player.voice = data.voice;

            await player.connect();
            await player.queue.utils.sync(true, false);

            if (data.track) player.queue.current = await player.queue.build(data.track, session.requester);

            player.filterManager.data = data.filters;

            player.connected = data.state.connected;
            player.paused = data.paused;
            player.lastPosition = data.state.position;
            player.lastPositionUpdate = Date.now();
            player.playing = !data.paused && !!data.track;
            player.ping = data.state.ping;

            if (!player.playing && player.queue.current) await player.play();

            await player.queue.utils.save();
        }
    },
});
