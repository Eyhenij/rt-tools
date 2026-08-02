import { INullable } from '../../interfaces/nullable.type.js';
import { isEmptyArray } from '../is-empty-array/index.js';
import { isNil } from '../is-nil/index.js';

/**
 * Indicates whether an object has no own enumerable string keys.
 *
 * A nullish argument counts as empty rather than throwing, matching how `isEmpty` treats absence.
 * Inherited, symbol-keyed and non-enumerable properties do not count — the check is `Object.keys`.
 *
 * @param value - the object to test
 * @returns `true` for `null`, `undefined` and an object with no own enumerable string keys
 *
 * @example
 * isEmptyObject({}); // true
 * isEmptyObject(null); // true
 * isEmptyObject({ a: undefined }); // false — the key is there
 */
export function isEmptyObject(value: INullable<Record<string, unknown>>): boolean {
    return isNil(value) || isEmptyArray(Object.keys(value));
}
