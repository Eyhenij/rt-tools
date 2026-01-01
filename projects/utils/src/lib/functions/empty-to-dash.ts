import { isNil } from '@rt-tools/core';
import { DASH } from '../const';

export function emptyToDash<T>(value: T | null | undefined): T | string {
    return isNil(value) || value === '' ? DASH : value;
}
