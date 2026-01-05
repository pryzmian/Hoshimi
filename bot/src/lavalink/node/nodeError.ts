import { Events } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events.js";

export default createLavalinkEvent({
    name: Events.NodeError,
    run(client, node, error) {
        client.logger.error(`Node ${node.id} emitted an error: ${error}`);
    },
});
