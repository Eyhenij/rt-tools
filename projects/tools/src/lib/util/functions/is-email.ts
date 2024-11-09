import { FormControl, Validators } from '@angular/forms';

/**
 * Check if the email is valid
 * @param email
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEmail(email: any): boolean {
    return !Boolean(Validators.email(new FormControl(email)));
}
