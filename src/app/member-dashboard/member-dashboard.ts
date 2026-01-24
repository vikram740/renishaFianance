import { Component, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { Common } from '../service/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-member-dashboard',
  imports: [
    MatFormFieldModule,
    RouterLink,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './member-dashboard.html',
  styleUrl: './member-dashboard.scss',
})
export class MemberDashboard {
  memberEmail!: string;
  memberId!: string;
  memeberData: any;
  common = inject(Common);

  platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.memberEmail = localStorage.getItem('memberEmail') || '';
    console.log('Stored Email:', this.memberEmail);

    if (!this.memberEmail) {
      this.logout();
      return;
    }
    this.getMemberDetails();
  }

 getMemberDetails() {
  const email = (localStorage.getItem('memberEmail') || '').trim().toLowerCase();

  if (!email) {
    console.warn('No memberEmail in localStorage');
    this.logout();
    return;
  }

  this.common.getAllMember().subscribe({
    next: (res: any) => {
      const members = res?.list || [];
      console.log('members', members)

      if (!Array.isArray(members)) {
        console.error('Invalid members response', res);
        return;
      }

      const member = members.find(
        (m: any) => (m.memberEmail || '').trim().toLowerCase() === email
      );

      if (!member) {
        console.warn('Member not found for email:', email);
        return;
      }

      this.memberId = member._id;
      this.memeberData = member;

      console.log('Member ID:', this.memberId);
      console.log('Member Data:', this.memeberData);
    },
    error: () => this.logout(),
  });
}


  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      location.href = '/login';
    }
  }
}
