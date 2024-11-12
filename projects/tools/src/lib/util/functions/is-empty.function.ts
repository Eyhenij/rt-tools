import { isEmptyArray } from './is-empty-array';
import { isEmptyObject } from './is-empty-object';
import { isEmptyString } from './is-empty-string';
import { isNil } from './is-nil';
import { isObject } from './is-object';
import { isString } from './is-string';

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
