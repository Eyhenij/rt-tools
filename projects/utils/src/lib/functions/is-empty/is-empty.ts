import { isEmptyArray } from '../is-empty-array/index.js';
import { isEmptyObject } from '../is-empty-object/index.js';
import { isEmptyString } from '../is-empty-string/index.js';
import { isNil } from '../is-nil/index.js';
import { isObject } from '../is-object/index.js';
import { isString } from '../is-string/index.js';

export function isEmpty(value: unknown): boolean {
    if (isNil(value)) {
        return true;
    }

    if (isObject(value)) {
        if (Array.isArray(value)) {
            return isEmptyArray(value);
        }

        if (!(value instanceof Date)) {
            return isEmptyObject(value);
        }
    }

    if (isString(value)) {
        return isEmptyString(value);
    }

    return false;
}
