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
import { Common } from '../service/common';

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
  common = inject(Common);
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

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const password = localStorage.getItem('adminPassword')

    if (token && role) {
      if (role === 'member') {
        this.router.navigate(['/memberDashboard']);
      } else if (role === 'agent') {
        this.router.navigate(['/collection']);
      } else {
        this.router.navigate(['/dashboard']); // admin
      }
      return;
    }

    // remember me
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
  }

  loginForm: FormGroup = this.fb.group({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$'),
    ]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: [false],
  });

  // initEffect = effect(() => {
  //   if (!isPlatformBrowser(this.platformId)) return;

  //   // Check token
  //   const token = localStorage.getItem('token');
  //   const role = localStorage.getItem('role');
  //   if (token) {
  //     if (role === 'member') {
  //       this.router.navigate(['/memberDashboard']);
  //     }
  //     if (role === 'agent') {
  //       this.router.navigate(['/collection']);
  //     } else {
  //       this.router.navigate(['/dashboard']);
  //     }
  //   }

  //   // Remember me
  //   const remember = JSON.parse(localStorage.getItem('rememberMe') || 'false');
  //   this.rememberMe.set(remember);

  //   if (remember) {
  //     const creds = this.authService.getCredentials();
  //     if (creds) {
  //       this.loginForm.patchValue({
  //         email: creds.email,
  //         password: creds.password,
  //         rememberMe: true,
  //       });
  //     }
  //   }
  // });

signIn() {
  if (this.loginForm.invalid) {
    this.submitted.set(true);
    toast.error('Please enter valid credentials');
    return;
  }

  const { rememberMe, email, password } = this.loginForm.value;

  this.authService.login(this.loginForm.value).subscribe({
    next: (res: any) => {
      localStorage.setItem('token', res.token);
      localStorage.setItem('role', res.role);
      localStorage.setItem('Id', res._id);

      // localStorage.setItem('rememberMe', JSON.stringify(rememberMe));

      // if (rememberMe) {
      //   this.authService.setCredentials(res);
      // } else {
      //   this.authService.clearCredentials();
      // }

      if (res.role === 'agent') {
        localStorage.setItem('agentEmail', res.email);
        localStorage.setItem('agentName', res.firstName);
        this.router.navigate(['/collection']);
        return;
      }

      if (res.role === 'member') {
        localStorage.setItem('memberEmail', res.email);
        localStorage.setItem('memberName', res.firstName);
        this.router.navigate(['/memberDashboard']);
        return;
      }

      if (res.role === 'admin') {
        this.router.navigate(['/dashboard']);
        localStorage.setItem('adminPassword', res.password);
        return;
      }
    },
    error: () => {
      toast.error('Login failed. Check credentials');
    },
  });
}




}
