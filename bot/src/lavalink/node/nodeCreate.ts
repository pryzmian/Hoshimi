import { EventNames } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events.js";

export default createLavalinkEvent({
    name: EventNames.NodeCreate,
    run(client, node) {
        client.logger.info(`Node ${node.id} is created.`);
    },
});
