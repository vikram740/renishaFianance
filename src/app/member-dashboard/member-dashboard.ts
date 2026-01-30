import { ChangeDetectorRef, Component, inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { Common } from '../service/common';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-member-dashboard',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    MatTableModule,
    MatPaginatorModule
  ],
  templateUrl: './member-dashboard.html',
  styleUrls: ['./member-dashboard.scss'],
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

  displayedColumns: string[] = [
  'dealIdNo', 'tenureType', 'tenureAmount', 'tenureInstallment', 'fromDate', 'endDate','lastpaidDate', 'wallet'
];
dataSource = new MatTableDataSource<any>([]);

@ViewChild(MatPaginator) paginator!: MatPaginator;

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
      console.log('members', members)

      const member = members.find(
       
        (m: any) => (m.memberEmail || '').trim().toLowerCase() === this.memberEmail
      );
       console.log('member', member)

      if (!member) {
        console.warn('Member not found');
        return;
      }

      this.memberId = member.memberIdNo;
      console.log('this.memberId', this.memberId)
      this.memeberData = member;
      this.getDeal()
    },
    error: () => this.logout(),
  });
}
getDeal() {
  const memberId = this.memberId; // make sure this is set in your component

  this.common.getDeal().subscribe((res: any) => {
    const allCollections = res.list || [];
    console.log('allCollections', allCollections)

    // Filter collections for the current member
      const memberDeals = allCollections.filter(
      (item: any) => item.memberId?.memberIdNo === memberId
    );
     this.collectionData = memberDeals;

    // Update dataSource for the table
    this.dataSource.data = memberDeals;

    // Assign paginator
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });

    // Get wallet from last collection (if any)
    const lastCollection = this.collectionData[this.collectionData.length - 1];
    this.walletAmount = lastCollection?.walletAmount?.wallet || 0;

    console.log('Filtered collections', this.collectionData);
    console.log('Wallet amount for member', this.walletAmount);
  });
}



 


  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      location.href = '/login';
    }
  }
}
