import { AbstractControl, ValidationErrors } from '@angular/forms';

// Custom validator to check for consecutive periods
export function noConsecutivePeriods(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string;
    if (value && value.includes('..')) {
        return { consecutivePeriods: true }; // Error object
    }
    return null; // No error
}