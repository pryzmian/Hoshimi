import { inspect as nodeInspect } from "node:util";

//const base64 = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
const base64 = /^[a-zA-Z0-9+/]*={0,2}$/;

/**
 *
 * Omit keys from an object.
 * @param {T} obj The object to omit keys from.
 * @param {K} keys The keys to omit.
 * @returns {Omit<T, K>}
 */
export const omitKeys = <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> =>
    Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key as K))) as Omit<T, K>;

/**
 *
 * Check if a string is base64 encoded.
 * @param {string} str The string to check.
 * @returns {boolean} True if the string is base64 encoded, false otherwise.
 */
export const isBase64 = (str: string): boolean => base64.test(str);

/**
 *
 * Inspect an object and return it as a string.
 * @param {any} obj The object to inspect.
 * @param {number} [depth=0] The depth to inspect the object.
 * @returns {string} The inspected object as a string.
 */
export const inspect = (obj: any, depth: number = 0): string => nodeInspect(obj, { depth });

/**
 *
 * Slice text to a specified length, adding ellipsis if it exceeds the length.
 * @param {string} text The text to slice.
 * @param {number} length The length to slice.
 * @returns {string} The sliced text.
 */
export const truncate = (text: string, length: number = 240): string => (text.length > length ? `${text.slice(0, length - 3)}...` : text);

/**
 *
 * Capitalize the first letter of a string.
 * @param {string} str The string to capitalize.
 * @returns {string} The capitalized string.
 */
export const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);
