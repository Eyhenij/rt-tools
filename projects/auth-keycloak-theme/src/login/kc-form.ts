import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** The error key of a field that Keycloak refused: its text comes from the page context. */
export const SERVER_ERROR: string = 'server';

/** The error key of a confirmation that differs from its pair. */
export const MISMATCH_ERROR: string = 'mismatch';

/** The example a login field shows when it takes an address. Not translated: an address reads the same in every language. */
const LOGIN_EXAMPLE: string = 'name@example.com';

/**
 * What an empty login field shows inside it. The label above already names the field, so the
 * placeholder gives an example of the value; a field that takes only a name gets none.
 *
 * @returns The example address, or an empty string.
 */
export function loginPlaceholder(emailAllowed: boolean): string {
    return emailAllowed ? LOGIN_EXAMPLE : '';
}

/**
 * Lets a valid form go to Keycloak by its own native submit and holds an invalid one on the page.
 *
 * Keycloak reads the posted fields by name, so the page posts a plain form rather than a request
 * of its own. A form with an empty required field is held: the field shows its error in place, and
 * Keycloak gets no request it would refuse anyway.
 *
 * @returns Whether the form leaves the page.
 */
export function holdInvalidSubmit(event: Event, form: AbstractControl): boolean {
    if (form.valid) {
        return true;
    }
    event.preventDefault();
    form.markAllAsTouched();

    return false;
}

/**
 * A confirmation equal to its pair field of the same form. An empty confirmation is left to the
 * required check, so it shows one error, not two.
 */
export function sameValueAs(pair: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value: unknown = control.parent?.get(pair)?.value;
        if (control.value === '' || value === undefined || control.value === value) {
            return null;
        }

        return { [MISMATCH_ERROR]: true };
    };
}

/**
 * The error Keycloak rendered for a field, held while the field keeps the value Keycloak refused.
 * A check rather than a set error: the form directive runs the checks again on start, and an error
 * set by hand would be gone before the first frame. It goes first in the list of checks, so the
 * field shows the refusal and not the required error of an emptied password.
 */
export function refusedValue(text: string, refused: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null =>
        text !== '' && control.value === refused ? { [SERVER_ERROR]: true } : null;
}
