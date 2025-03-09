import type { UserAgent } from "../types/Node";

import PackageJson from "../../package.json";

/**
 * The user agent for Hoshimi.
 * @type {string}
 */
export const HoshimiAgent: UserAgent = `hoshimi/v${PackageJson.version} (${PackageJson.repository.url})`;
