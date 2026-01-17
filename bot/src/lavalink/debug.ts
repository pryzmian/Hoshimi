import { DebugLevels, EventNames } from "hoshimi";
import { createLavalinkEvent } from "../manager/events.js";

export default createLavalinkEvent({
    name: EventNames.Debug,
    async run(client, level, message) {
        const isDebug = await client.getRC().then((rc) => rc.debug);
        if (isDebug) client.logger.debug(`[Hoshimi] ${DebugLevels[level]}: ${message}`);
    },
});
