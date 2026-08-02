import { INullable } from '../../interfaces/nullable.type.js';
import { isNil } from '../is-nil/index.js';

/**
 * Indicates whether an array holds no elements.
 *
 * A nullish argument counts as empty rather than throwing, matching how `isEmpty` treats absence.
 *
 * @param value - the array to test
 * @returns `true` for `null`, `undefined` and `[]`
 *
 * @example
 * isEmptyArray([]); // true
 * isEmptyArray(null); // true
 * isEmptyArray([undefined]); // false — one element, and it is present as a slot
 */
export function isEmptyArray<T>(value: INullable<T[]>): boolean {
    return isNil(value) || value.length === 0;
}
