import { createEvent } from "seyfert";
import { Constants } from "../constants";

export default createEvent({
    data: { name: "ready", once: true },
    run: async (user, client): Promise<void> => {
        client.logger.info(`Logged in as ${user.username}`);
        client.manager.init({ ...user });

        await client.uploadCommands({ cachePath: Constants.CachePath() });
    },
});
