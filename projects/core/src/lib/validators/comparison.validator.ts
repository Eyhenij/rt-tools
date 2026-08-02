import { AbstractControl, ValidatorFn } from '@angular/forms';

export function checkIsMatchingValues(sample: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
        return sample && control.value && control.value.localeCompare(sample) === 0 ? null : { notEquivalent: true };
    };
}
