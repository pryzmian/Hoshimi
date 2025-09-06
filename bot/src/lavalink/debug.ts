import { DebugLevels, Events } from "hoshimi";
import { createLavalinkEvent } from "../manager/events";

export default createLavalinkEvent({
    name: Events.Debug,
    async run(client, level, message) {
        const isDebug = await client.getRC().then((rc) => rc.debug);
        if (isDebug) client.logger.debug(`[Hoshimi] ${DebugLevels[level]}: ${message}`);
    },
});
