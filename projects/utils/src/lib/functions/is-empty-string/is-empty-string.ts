import { Nullable } from '../../interfaces/nullable.type.js';
import { isNil } from '../is-nil/index.js';

/**
 * Indicates whether a string holds no characters.
 *
 * A nullish argument counts as empty rather than throwing, matching how `isEmpty` treats absence.
 * Whitespace is **not** trimmed — `'   '` is not empty.
 *
 * @param value - the string to test
 * @returns `true` for `null`, `undefined` and `''`
 *
 * @example
 * isEmptyString(''); // true
 * isEmptyString(null); // true
 * isEmptyString('   '); // false
 */
export function isEmptyString(value: Nullable<string>): boolean {
    return isNil(value) || value.length === 0;
}
