import { TNullable } from '../../interfaces/nullable.type.js';

export enum EHasOwnScope {
    ANY = 'any',
    OWN = 'own',
    INHERITED = 'inherited',
}

export type THasScopeType = EHasOwnScope.ANY | EHasOwnScope.OWN | EHasOwnScope.INHERITED;

/** Internal: cross-runtime own-property check (uses Object.hasOwn if available, otherwise falls back to hasOwnProperty.call). */
type THasOwnFn = (o: object, k: PropertyKey) => boolean;
const safetyHasOwn: THasOwnFn = (o: object, k: PropertyKey) => {
    const native: TNullable<THasOwnFn> = (Object as unknown as { hasOwn?: THasOwnFn }).hasOwn;
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
 * @param scope {THasScopeType} - Check mode: `'any'` (default), `'own'`, or `'inherited'`.
 *
 * @returns `true` if the property exists under the selected scope.
 *
 * @example
 * hasPropertyInChain({ a: 1 }, 'a'); // true (ANY)
 * hasPropertyInChain(Object.create({ a: 1 }), 'a', EHasOwnScope.INHERITED); // true
 * hasPropertyInChain({ a: 1 }, 'b', EHasOwnScope.OWN); // false
 */
export function hasPropertyInChain(obj: unknown, key: PropertyKey, scope: THasScopeType = EHasOwnScope.OWN): boolean {
    if (obj === undefined || obj === null) {
        return false;
    }
    const o: object = Object(obj);

    switch (scope) {
        case EHasOwnScope.OWN:
            return safetyHasOwn(o, key);

        case EHasOwnScope.INHERITED:
            return key in o && !safetyHasOwn(o, key);

        default:
            return key in o;
    }
}
