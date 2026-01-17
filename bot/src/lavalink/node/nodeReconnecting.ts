import { EventNames } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events.js";
import { TimeFormat } from "../../time";

export default createLavalinkEvent({
    name: EventNames.NodeReconnecting,
    run(client, node, retriesLeft, delay) {
        client.logger.warn(`Node ${node.id} is reconnecting with ${retriesLeft} retries left in ${TimeFormat.toHumanize(delay)}...`);
    },
});
