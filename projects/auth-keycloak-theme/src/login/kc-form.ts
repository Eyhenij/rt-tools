import { AbstractControl } from '@angular/forms';

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
