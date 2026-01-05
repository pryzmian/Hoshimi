import { Events } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events.js";

export default createLavalinkEvent({
    name: Events.NodeDestroy,
    run(client, node, destroy) {
        client.logger.warn(`Node ${node.id} is destroyed with the reason ${destroy.reason} (${destroy.code}).`);
    },
});
