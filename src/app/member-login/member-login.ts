import { ChangeDetectorRef, Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { Common } from '../service/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-member-login',
  imports: [FormsModule, ReactiveFormsModule, MatProgressSpinnerModule, CommonModule],
  templateUrl: './member-login.html',
  styleUrl: './member-login.scss',
})
export class MemberLogin {
  memberLoginForm!: FormGroup;
  fb = inject(FormBuilder);
  submitted = false;
  router = inject(Router);
  common = inject(Common);
  cdr = inject(ChangeDetectorRef);
  membersList: any[] = [];
  showTable = false;
  isLoading: boolean = false;

  ngOnInit() {
    // this.getMembers();
    this.memberLoginForm = this.fb.group({
      memberId: new FormControl('', [Validators.required]),
    });
    
  }



enter() {
  if (this.memberLoginForm.invalid) {
    this.submitted = true;
    toast.error('Login Failed', { class: 'toast-error' });
    this.showTable = false;
    return;
  }

  const enterId = this.memberLoginForm.value.memberId.trim();

  this.common.getDeal().subscribe({
    next: (res: any) => {
      const allDeals = res.list || [];
      console.log('allDeals', allDeals)


      const memberDeals = allDeals.filter(
      
        (d: any) => d.memberId?.memberIdNo === enterId
      );
        console.log('memberDeals', memberDeals)

      if (memberDeals.length === 0) {
        toast.error('Invalid Member ID or No Deals Found');
        this.membersList = [];
        this.showTable = false;
        this.cdr.detectChanges();
        return;
      }

      toast.success('Login Successful', { class: 'toast-success' });
      this.membersList = memberDeals;
      console.log('this.membersList', this.membersList)
      this.showTable = true;
      this.cdr.detectChanges();
    },
    error: () => {
      toast.error('Something went wrong');
      this.showTable = false;
      this.cdr.detectChanges();
    },
  });
}

payNow(deal: any) {
  this.router.navigate(['/memberAddCollection', deal._id]);
}



}
