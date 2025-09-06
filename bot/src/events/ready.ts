import { createEvent } from "seyfert";

export default createEvent({
    data: { name: "ready", once: true },
    run: async (user, client): Promise<void> => {
        client.logger.info(`Logged in as ${user.username}`);
        client.manager.init({ ...user, username: user.username });

        await client.uploadCommands({ cachePath: "./cache/commands.json" });
    },
});
