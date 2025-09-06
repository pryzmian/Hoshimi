import { Events } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events";

export default createLavalinkEvent({
    name: Events.NodeCreate,
    run(client, node) {
        client.logger.info(`Node ${node.id} is created.`);
    },
});
