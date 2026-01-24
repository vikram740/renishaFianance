import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { Auth } from '../service/auth';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, MatProgressSpinnerModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(Auth);
  platformId = inject(PLATFORM_ID);

  fullName: any;
  role: any;
  // loginForm: FormGroup;
  submitted = signal(false);
  rememberMe = signal(false);
  // isLoading:boolean=false;

  // ngOnInit() {
  //   this.loginForm = this.fb.group({
  //     email: new FormControl('', [Validators.required, Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$")]),
  //     // email: ['', [Validators.required, Validators.pattern(/^(\d{10}|\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3}))$/)]],
  //     password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  //     rememberMe: [false]

  //   });
  //   // ✅ Browser-only code
  //   if (isPlatformBrowser(this.platformId)) {
  //     this.checkToken();

  //     this.rememberMe = JSON.parse(
  //       localStorage.getItem('rememberMe') || 'false'
  //     );

  //     if (this.rememberMe) {
  //       const creds = this.authService.getCredentials();

  //       if (creds !== null) {
  //         this.loginForm.patchValue({
  //           email: creds.email,
  //           password: creds.password,
  //           rememberMe: true
  //         });
  //       }
  //     }
  //   }
  // }

  loginForm: FormGroup = this.fb.group({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$'),
    ]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: [false],
  });

  initEffect = effect(() => {
    if (!isPlatformBrowser(this.platformId)) return;

    // Check token
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      if (role === 'member') {
        this.router.navigate(['/memberDashboard']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }

    // Remember me
    const remember = JSON.parse(localStorage.getItem('rememberMe') || 'false');
    this.rememberMe.set(remember);

    if (remember) {
      const creds = this.authService.getCredentials();
      if (creds) {
        this.loginForm.patchValue({
          email: creds.email,
          password: creds.password,
          rememberMe: true,
        });
      }
    }
  });

  signIn() {
    if (this.loginForm.invalid) {
      this.submitted.set(true);
      toast.error('Login Failed', { class: 'toast-error' });
      return;
    } else {
      // this.isLoading=true;
      this.authService.login(this.loginForm.value).subscribe((res: any) => {
        console.log('login', res);
        // calling user name from the service file
        this.fullName = res.firstName + ' ' + res.lastName;
        this.authService.setName(this.fullName);

        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        this.authService.getCredentials();

        if (res.role === 'admin') {
          localStorage.setItem('adminPassword', res.password);
        }
        if (res.role === 'agent') {
          localStorage.setItem('agentEmail', res.email);
        }

        // calling user role from the service file
        this.role = res.role;
        this.authService.setRole(this.role);

        // remember me functionality
        if (this.loginForm.value.rememberMe) {
          this.authService.setCredentials(this.loginForm.value);
        } else {
          // user explicitly unchecked remember me
          this.authService.clearCredentials();
        }
        // this.isLoading=false;
        if (this.role === 'member') {
          localStorage.setItem('memberEmail', res.email);
          this.router.navigate(['/memberDashboard']);
        } else {
          this.router.navigate(['/dashboard']);
          toast.success('Login Successfully', { class: 'toast-success' });
        }
      });
    }
  }
}
