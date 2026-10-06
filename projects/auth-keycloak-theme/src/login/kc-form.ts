import { AbstractControl } from '@angular/forms';

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
