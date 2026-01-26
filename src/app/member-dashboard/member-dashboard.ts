import { ChangeDetectorRef, Component, inject, PLATFORM_ID } from '@angular/core';
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
  collectionData:any
  walletAmount = 0;
    cdr = inject(ChangeDetectorRef);

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
    this.logout();
    return;
  }

  this.common.getAllMember().subscribe({
    next: (res: any) => {
      const members = res?.list || [];

      const member = members.find(
        (m: any) => (m.memberEmail || '').trim().toLowerCase() === email
      );

      if (!member) {
        console.warn('Member not found');
        return;
      }

      this.memberId = member._id;
      this.memeberData = member;

      this.getDealCollection();
    },
    error: () => this.logout(),
  });
}


getDealCollection(){
  this.common.getDealCollections().subscribe((res:any)=>{
    const all = res?.list|| [];
    this.collectionData = all.filter(
      (c: any) => String(c.memberId) === String(this.memberId)
    );

     this.walletAmount = this.collectionData.reduce(
      (sum: number, c: any) => sum + Number(c.amount || 0),
      0
    );
    this.cdr.detectChanges()

    console.log('this.collectionData', this.collectionData);
     console.log('this.walletAmount', this.walletAmount)
  })

}


  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      location.href = '/login';
    }
  }
}
