import { createEvent } from "seyfert";

export default createEvent({
	data: { name: "ready", once: true },
	run: async (user, client) => {
		client.logger.info(`Logged in as ${user.username}`);
		client.manager.init({ ...user, username: user.username });
	},
});
