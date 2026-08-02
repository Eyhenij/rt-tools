import { AbstractControl, ValidationErrors } from '@angular/forms';

export function arraysNotEmptyValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value instanceof Object) {
        const arrays: unknown[][] = Object.values(control.value);
        const allArraysEmpty: boolean = arrays.every((array: unknown[]) => !array.length);
        return allArraysEmpty ? { allArraysEmpty: true } : null;
    } else if (Array.isArray(control.value)) {
        const array: unknown[] = control.value;
        return !array.length ? { arrayEmpty: true } : null;
    } else {
        return { invalidType: true };
    }
}
