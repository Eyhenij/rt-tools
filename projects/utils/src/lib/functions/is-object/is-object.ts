/**
 * Internal type guard for non-null objects.
 *
 * `typeof value === 'object'` alone reports `true` for `null`, which would make the `Record` in the
 * signature a lie, so the null check is part of the guard.
 *
 * Not exported from the package: arrays, dates and every class instance also pass, which is right
 * for the one caller — `isEmpty`, which special-cases both immediately afterwards — and misleading
 * for anyone else. Use `isRecord` for a plain object literal.
 */
export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}
