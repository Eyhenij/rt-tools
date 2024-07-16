import { AbstractControl, ValidationErrors } from '@angular/forms';

export function arraysNotEmptyValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value instanceof Object) {
        const arrays: any[][] = Object.values(control.value);
        const allArraysEmpty: boolean = arrays.every((array: any[]) => !array.length);
        return allArraysEmpty ? { allArraysEmpty: true } : null;
    } else if (Array.isArray(control.value)) {
        const array: any[] = control.value;
        return !array.length ? { arrayEmpty: true } : null;
    } else {
        return { invalidType: true };
    }
}
