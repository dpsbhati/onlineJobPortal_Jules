import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class FuseValidators {
    /**
     * Check if a value is empty
     *
     * @param value The value to check
     */
    static isEmptyInputValue(value: any): boolean {
        return value == null || value.length === 0;
    }

    /**
     * Validator to ensure two form controls match
     *
     * @param controlPath The path to the control
     * @param matchingControlPath The path to the matching control
     * @returns A ValidatorFn
     */
    static mustMatch(controlPath: string, matchingControlPath: string): ValidatorFn {
        return (formGroup: AbstractControl): ValidationErrors | null => {
            // Retrieve the controls
            const control = formGroup.get(controlPath);
            const matchingControl = formGroup.get(matchingControlPath);

            // Exit if controls are not found
            if (!control || !matchingControl) {
                return null;
            }

            // Clear existing 'mustMatch' error if it exists
            if (matchingControl.errors?.['mustMatch']) {
                delete matchingControl.errors['mustMatch'];
                matchingControl.updateValueAndValidity({ onlySelf: true });
            }


            // Skip validation if the matching control's value is empty or values match
            if (this.isEmptyInputValue(matchingControl.value) || control.value === matchingControl.value) {
                return null;
            }

            // Set the 'mustMatch' validation error on the matching control
            matchingControl.setErrors({ mustMatch: true });

            return { mustMatch: true };
        };
    }
}
