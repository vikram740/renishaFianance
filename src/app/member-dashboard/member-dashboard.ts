import { ChangeDetectorRef, Component, inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { Common } from '../service/common';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { BehaviorSubject } from 'rxjs';

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
    MatPaginatorModule,
    CommonModule
  ],
  templateUrl: './member-dashboard.html',
  styleUrls: ['./member-dashboard.scss'],
})
export class MemberDashboard {
 
  private common = inject(Common);
  private platformId = inject(PLATFORM_ID);

  memberEmail = '';
  memberId = '';

  walletAmount = 0;
  totalInstallments=0
  totalPaidAmount = 0;

  dataSource = new MatTableDataSource<any>([]);

  // 🔥 Observable-driven modal data
  installment$ = new BehaviorSubject<any[] | null>(null);
  collectionList:any =[]
  cdr = inject(ChangeDetectorRef)

  page = 1;
  limit = 5;
  total = 0;

  displayedColumns: string[] = [
    'dealIdNo',
    'tenureType',
    'tenureAmount',
    'tenureInstallment',
    'fromDate',
    'endDate',
    'lastPaidDate',
    'wallet',
    'action'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.memberEmail = localStorage.getItem('memberEmail') || '';
    if (!this.memberEmail) {
      this.logout();
      return;
    }

    this.getMemberDetails();
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(event => {
      this.page = event.pageIndex + 1;
      this.limit = event.pageSize;
      this.getDeals();
    });
  }

  getMemberDetails() {
    this.common.getAllMember().subscribe({
      next: (res: any) => {
        const member = res?.list?.find(
          (m: any) =>
            m.memberEmail?.toLowerCase().trim() ===
            this.memberEmail.toLowerCase().trim()
        );

        if (!member) {
          this.logout();
          return;
        }

        this.memberId = member.memberIdNo;
        this.getDeals();
      },
      error: () => this.logout()
    });
  }

  getDeals() {
    this.common.getDeals(this.page, this.limit).subscribe((res: any) => {
      const list = res?.data?.list || [];
      this.total = res?.data?.total || 0;

      const memberDeals = list.filter(
        (d: any) => d.memberIdNo === this.memberId
      );

      this.dataSource.data = memberDeals;

      this.walletAmount = memberDeals.reduce(
        (sum: number, d: any) => sum + (Number(d.walletAmount) || 0),
        0
      );
    });
  }

  // 🔥 NO FLAGS, NO NG0100
 viewDocuments(dealId: string) {
  // loading state
  this.installment$.next([]);

  // call BOTH APIs independently
  this.common.getSingleDeal(dealId).subscribe((res: any) => {
    this.installment$.next(res?.data?.interestHistory || []);
    this.cdr.markForCheck();
  });

  this.common.getDealInsallment(dealId).subscribe((res: any) => {
    this.collectionList = res
    this.totalInstallments = res?.totalInstallments;
    this.totalPaidAmount = res?.totalPaidAmount


    console.log('this.collectionList', this.collectionList)

    this.collectionList = [...(res?.installments || [])];
    console.log('collectionList length:', this.collectionList.length);
     this.cdr.markForCheck();
  });
}

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      location.href = '/login';
    }
  }
}
