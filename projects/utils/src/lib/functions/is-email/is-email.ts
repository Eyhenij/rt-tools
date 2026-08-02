/**
 * @description Pattern an address must match to count as an email.
 *
 * Kept identical to the one Angular's `Validators.email` applies, so callers get the same verdicts
 * as before this function stopped depending on `@angular/forms`. It caps the whole address and the
 * local part by length, allows the atom characters in the local part, and requires every domain
 * label to start and end with an alphanumeric.
 */
export const EMAIL_REGEXP: RegExp =
    /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isEmptyInputValue(value: any): boolean {
    return value === null || value === undefined || ((typeof value === 'string' || Array.isArray(value)) && value.length === 0);
}

/**
 * @description Check if the value is a valid email address.
 *
 * An empty value — `''`, `null`, `undefined` or an empty array — yields `true`: a check that only
 * rejects malformed input leaves "is anything there at all" to a separate required-check. That is
 * the long-standing behaviour of this function, inherited from the validator it used to delegate
 * to. Pair it with an emptiness check where a value is mandatory.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEmail(value: any): boolean {
    if (isEmptyInputValue(value)) {
        return true;
    }

    return EMAIL_REGEXP.test(value);
}
