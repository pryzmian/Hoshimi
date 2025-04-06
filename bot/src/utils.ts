/**
 *
 * Omit keys from an object.
 * @param {T} obj The object to omit keys from.
 * @param {K} keys The keys to omit.
 * @returns {Omit<T, K>}
 */
export const omitKeys = <T extends Record<string, any>, K extends keyof T>(
	obj: T,
	keys: K[],
): Omit<T, K> =>
	Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key as K))) as Omit<
		T,
		K
	>;
