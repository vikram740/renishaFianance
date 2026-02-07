import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../service/auth';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, FormsModule,],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  signupForm !: FormGroup
  fb = inject(FormBuilder)
  submitted = false
  router = inject(Router)
  authService = inject(Auth)
  @Output() close = new EventEmitter<void>();

   @Input() prefillData: any;

   showPassword = false;
 
  ngOnInit() {
    this.signupForm = this.fb.group({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$")]),
      // email: ['', [Validators.required, Validators.pattern(/^(\d{10}|\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3}))$/)]],

      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      role: new FormControl('', [Validators.required])
    })

     if (this.prefillData) {
      this.signupForm.patchValue(this.prefillData);

      // lock fields if needed
      this.signupForm.get('email')?.disable();
      this.signupForm.get('role')?.disable();
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['prefillData'] && this.prefillData && this.signupForm) {
      this.signupForm.reset(); // 🔥 reset old data
      this.signupForm.patchValue(this.prefillData);

      this.signupForm.get('email')?.disable();
      this.signupForm.get('role')?.disable();
    }
  }

  togglePassword() {
  this.showPassword = !this.showPassword;
}

  signUp() {
    if (this.signupForm.invalid) {
      this.submitted = true;
      toast.error('Signup Failed', { class: 'toast-error' })
      return
    } else {
      this.authService.signup(this.signupForm.getRawValue()).subscribe((res: any) => {
        console.log('signup', res)
        toast.success('Signup Successfully', { class: 'toast-success' })
         document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove());
        document.body.classList.remove('modal-open');
      })
    }
  }
}
