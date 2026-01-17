import { EventNames } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events.js";

export default createLavalinkEvent({
    name: EventNames.NodeDisconnect,
    run(client, node) {
        client.logger.error(`Node ${node.id} disconnected.`);
    },
});
