import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function mustMatch(
    controlName: string,
    matchingControlName: string
): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const formGroup = control as any;

        const password = formGroup.get(controlName);
        const confirmPassword = formGroup.get(matchingControlName);

        if (!password || !confirmPassword) {
            return null;
        }

        if (confirmPassword.errors && !confirmPassword.errors['mustMatch']) {
            return null;
        }

        if (password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ mustMatch: true });
            return { mustMatch: true };
        } else {
            confirmPassword.setErrors(null);
            return null;
        }
    };
}
