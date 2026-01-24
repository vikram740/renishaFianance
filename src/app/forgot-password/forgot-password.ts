import { Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../service/auth';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  fb = inject(FormBuilder)
  router = inject(Router)
  authService = inject(Auth)
  platformId = inject(PLATFORM_ID);

  fullName: any;
  role: any;
  // loginForm: FormGroup;
  submitted = signal(false);
  rememberMe = signal(false);


  forgotPasswordForm: FormGroup = this.fb.group({
    email: new FormControl('', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$'),]),

  });

  initEffect = effect(() => {

  });

  send() {
    if (this.forgotPasswordForm.invalid) {
      this.submitted.set(true);
      toast.error('Email sent failed', { class: 'toast-error' })
      return
    } else {
      this.authService.login(this.forgotPasswordForm.value).subscribe((res: any) => {
        console.log('forgotpass', res)
        this.router.navigate(['/dashboard'])
        toast.success('Email sent successfully', { class: 'toast-success' })
      })
    }
  }

}
