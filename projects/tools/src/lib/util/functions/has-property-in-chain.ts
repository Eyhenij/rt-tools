import { Nullable } from '../interfaces';

export enum HAS_OWN_SCOPE_ENUM {
    ANY = 'any',
    OWN = 'own',
    INHERITED = 'inherited',
}

export type IHasScopeType = HAS_OWN_SCOPE_ENUM.ANY | HAS_OWN_SCOPE_ENUM.OWN | HAS_OWN_SCOPE_ENUM.INHERITED;

/** Internal: cross-runtime own-property check (uses Object.hasOwn if available, otherwise falls back to hasOwnProperty.call). */
type HasOwnFn = (o: object, k: PropertyKey) => boolean;
const safetyHasOwn: HasOwnFn = (o: object, k: PropertyKey) => {
    const native: Nullable<HasOwnFn> = (Object as unknown as { hasOwn?: HasOwnFn }).hasOwn;
    return typeof native === 'function' ? native(o, k) : Object.prototype.hasOwnProperty.call(o, k);
};

/**
 * Safe property existence check with configurable scope.
 *
 * - Returns `false` for `null`/`undefined`.
 * - Boxes primitives (e.g., strings, numbers) so prototype checks work.
 * - Does **not** invoke getters; relies on `in` and an own-check helper.
 * - Uses `Object.hasOwn` when available; **falls back** to
 *   `Object.prototype.hasOwnProperty.call` on older runtimes.
 *
 * @param obj {unknown} - Value to check. `null`/`undefined` short-circuit to `false`.
 * @param key {PropertyKey} - Property key (string | number | symbol).
 * @param scope {IHasScopeType} - Check mode: `'any'` (default), `'own'`, or `'inherited'`.
 *
 * @returns `true` if the property exists under the selected scope.
 *
 * @example
 * hasPropertyInChain({ a: 1 }, 'a'); // true (ANY)
 * hasPropertyInChain(Object.create({ a: 1 }), 'a', HAS_OWN_SCOPE_ENUM.INHERITED); // true
 * hasPropertyInChain({ a: 1 }, 'b', HAS_OWN_SCOPE_ENUM.OWN); // false
 */
export const hasPropertyInChain: (obj: unknown, key: PropertyKey, scope?: IHasScopeType) => boolean = (
    obj: unknown,
    key: PropertyKey,
    scope: IHasScopeType = HAS_OWN_SCOPE_ENUM.OWN
): boolean => {
    if (obj === undefined || obj === null) {
        return false;
    }
    const o: object = Object(obj);

    switch (scope) {
        case HAS_OWN_SCOPE_ENUM.OWN:
            return safetyHasOwn(o, key);

        case HAS_OWN_SCOPE_ENUM.INHERITED:
            return key in o && !safetyHasOwn(o, key);

        default:
            return key in o;
    }
};
