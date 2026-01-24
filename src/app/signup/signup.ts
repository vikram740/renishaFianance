import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../service/auth';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  signupForm !: FormGroup
  fb = inject(FormBuilder)
  submitted = false
  router = inject(Router)
  authService = inject(Auth)

  ngOnInit() {
    this.signupForm = this.fb.group({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$")]),
      // email: ['', [Validators.required, Validators.pattern(/^(\d{10}|\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3}))$/)]],

      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      role: new FormControl('', [Validators.required])
    })
  }

  signUp() {
    if (this.signupForm.invalid) {
      this.submitted = true;
      toast.error('Signup Failed', { class: 'toast-error' })
      return
    } else {
      this.authService.signup(this.signupForm.value).subscribe((res: any) => {
        console.log('signup', res)
        this.router.navigate(['/login'])
        toast.success('Signup Successfully', { class: 'toast-success' })
      })
    }
  }
}
