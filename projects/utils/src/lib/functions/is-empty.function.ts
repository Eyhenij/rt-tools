import { isEmptyArray } from './is-empty-array.js';
import { isEmptyObject } from './is-empty-object.js';
import { isEmptyString } from './is-empty-string.js';
import { isNil } from './is-nil.js';
import { isObject } from './is-object.js';
import { isString } from './is-string.js';

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
