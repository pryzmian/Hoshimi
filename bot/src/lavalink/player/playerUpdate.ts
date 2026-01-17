import { EventNames, type PlayerJson } from "hoshimi";
import { Constants } from "../../constants.js";
import { createLavalinkEvent } from "../../manager/events.js";
import { Sessions } from "../../manager/sessions.js";
import type { HoshimiUser, SessionJson } from "../../manager/types.js";
import { omitKeys } from "../../utils.js";

export default createLavalinkEvent({
    name: EventNames.PlayerUpdate,
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
            const autoplay = await newPlayer.data.get("enabledAutoplay");
            const lyrics = await newPlayer.data.get("enabledLyrics");
            const lyricsId = await newPlayer.data.get("lyricsId");

            Sessions.set<SessionJson>(newPlayer.guildId, {
                ...newJson,
                requester,
                enabledAutoplay: autoplay,
                enabledLyrics: lyrics,
                lyricsId: lyricsId,
                messageId: newPlayer.textId,
                node: {
                    id: newPlayer.node.id,
                    sessionId: newPlayer.node.sessionId,
                },
            });
        }

        if (Constants.Debug)
            client.debugger?.info(`Session: ${newPlayer.guildId} | Updated Session: ${JSON.stringify(Sessions.get(newPlayer.guildId))}`);
    },
});
