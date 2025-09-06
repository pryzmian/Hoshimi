import { Events } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events";
import { TimeFormat } from "../../time";

export default createLavalinkEvent({
    name: Events.NodeReconnecting,
    run(client, node, retriesLeft, delay) {
        client.logger.warn(`Node ${node.id} is reconnecting with ${retriesLeft} retries left in ${TimeFormat.toHumanize(delay)}...`);
    },
});
