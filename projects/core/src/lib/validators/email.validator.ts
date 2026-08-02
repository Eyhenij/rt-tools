import { AbstractControl, ValidationErrors } from '@angular/forms';

import { isEmail } from '@rt-tools/utils';

/**
 * @description Reactive-forms validator over the framework-free `isEmail` predicate.
 *
 * Reports `{ email: true }` on a malformed address. An empty control passes, matching `isEmail` —
 * combine it with `Validators.required` where the field is mandatory.
 */
export function emailValidator(control: AbstractControl): ValidationErrors | null {
    return isEmail(control.value) ? null : { email: true };
}
