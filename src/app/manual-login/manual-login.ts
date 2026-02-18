import { Component } from '@angular/core';
import { ChangeDetectorRef, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { Common } from '../service/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manual-login',
  imports: [ReactiveFormsModule,CommonModule,FormsModule],
  templateUrl: './manual-login.html',
  styleUrl: './manual-login.scss',
})
export class ManualLogin {
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
      const allDeals = res?.list || [];
      console.log('allDeals', allDeals)


      const memberDeals = allDeals.filter(
      
        (d: any) => d.memberIdNo === enterId
      );

      if (memberDeals.length === 0) {
        toast.error('No Deals Found', { class: 'toast-error' });
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
  this.router.navigate(['/manual-collection', deal._id]);
}

}
