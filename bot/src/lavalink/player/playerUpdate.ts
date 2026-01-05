import { Events, type PlayerJson } from "hoshimi";
import { Constants } from "../../constants";
import { createLavalinkEvent } from "../../manager/events";
import { Sessions } from "../../manager/sessions";
import { omitKeys } from "../../utils";
import type { HoshimiUser, SessionJson } from "../../manager/types";

export default createLavalinkEvent({
    name: Events.PlayerUpdate,
    async run(client, newPlayer, oldPlayer) {
        const newPlayerJson: PlayerJson = newPlayer.toJSON();

        if (
            !oldPlayer ||
            oldPlayer.voiceId !== newPlayerJson.voiceId ||
            oldPlayer.textId !== newPlayerJson.textId ||
            oldPlayer.options.selfDeaf !== newPlayerJson.options.selfDeaf ||
            oldPlayer.options.selfMute !== newPlayerJson.options.selfDeaf ||
            oldPlayer.node.id !== newPlayerJson.node.id ||
            oldPlayer.node.sessionId !== newPlayerJson.node.sessionId
        ) {
            if (newPlayerJson.queue?.current) newPlayerJson.queue.current.userData = {};

            const newJson = omitKeys(newPlayerJson, [
                "ping",
                "createdTimestamp",
                "lastPositionUpdate",
                "paused",
                "playing",
                "queue",
                "filters",
            ]);

            const requester = newPlayer.queue.current?.requester ?? ({} as HoshimiUser);

            Sessions.set<SessionJson>(newPlayer.guildId, {
                ...newJson,
                requester,
            });
        }

        if (Constants.Debug)
            client.debugger?.info(`Session: ${newPlayer.guildId} | Updated Session: ${JSON.stringify(Sessions.get(newPlayer.guildId))}`);
    },
});
