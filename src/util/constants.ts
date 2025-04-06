import type { UserAgent } from "../types/Node";
import { SearchEngines } from "../types/Manager";

import PackageJson from "../../package.json";

/**
 * The user agent for Hoshimi.
 * @type {UserAgent}
 */
export const HoshimiAgent: UserAgent = `hoshimi/v${PackageJson.version} (${PackageJson.repository.url})`;

/**
 * The url regex for Hoshimi.
 * @type {RegExp}
 */
export const UrlRegex: RegExp = /^(https?:\/\/)?([a-zA-Z0-9\-_]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;

/**
 * The valid search engines for Hoshimi.
 * @type {SearchEngines[]}
 */
export const ValidEngines: SearchEngines[] = Object.values(SearchEngines);
