import { CommonModule } from '@angular/common';
import { Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../service/auth';
import { toast } from 'ngx-sonner';
import { mustMatch } from '../../_helpers/mustMatch.validator ';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  fb = inject(FormBuilder)
  router = inject(Router)
  authService = inject(Auth)
  platformId = inject(PLATFORM_ID);

  fullName: any;
  role: any;
  submitted = signal(false);
  rememberMe = signal(false);


  resetPasswordForm: FormGroup = this.fb.group({
    password: new FormControl('', [Validators.required, Validators.minLength(6),]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6),]),
  },
    {
      validators: mustMatch('password', 'confirmPassword'),
    }
  );

  initEffect = effect(() => {

  });

  resetPassword() {
    if (this.resetPasswordForm.invalid) {
      this.submitted.set(true);
      toast.error('Reset password failed', { class: 'toast-error' })
      return
    } else {
      this.authService.login(this.resetPasswordForm.value).subscribe((res: any) => {
        console.log('resetpass', res)
        this.router.navigate(['/dashboard'])
        toast.success('Reset password successfully', { class: 'toast-success' })
      })
    }
  }
}
