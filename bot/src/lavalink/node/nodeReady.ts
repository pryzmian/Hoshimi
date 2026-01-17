import { EventNames } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events.js";

export default createLavalinkEvent({
    name: EventNames.NodeReady,
    run(client, node, retries) {
        client.logger.info(`Node ${node.id} is ready with ${retries} retries.`);
    },
});
