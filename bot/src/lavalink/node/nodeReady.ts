import { Events } from "hoshimi";
import { createLavalinkEvent } from "../../manager/events";

export default createLavalinkEvent({
	name: Events.NodeReady,
	run(client, node) {
		client.logger.info(`Node ${node.id} is ready.`);
	},
});
