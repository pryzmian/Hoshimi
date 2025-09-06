import { Events } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events";

export default createLavalinkEvent({
    name: Events.NodeDisconnect,
    run(client, node) {
        client.logger.error(`Node ${node.id} disconnected.`);
    },
});
