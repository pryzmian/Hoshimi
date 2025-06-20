import { DebugLevels } from "hoshimi";
import type { UsingClient } from "seyfert";

/**
 * Logs debug messages for the Hoshimi Lavalink client.
 * @param client The Seyfert client instance.
 * @param level The debug level of the message.
 * @param message The debug message to log.
 */
export async function debug(
	client: UsingClient,
	level: DebugLevels,
	message: string,
): Promise<void> {
	const isDebug = await client.getRC().then((rc) => rc.debug);
	if (isDebug) client.logger.debug(`[Hoshimi] ${DebugLevels[level]}: ${message}`);
}
