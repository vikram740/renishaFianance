import { ChangeDetectorRef, Component, inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { Common } from '../service/common';
import { CommonModule, DatePipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
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
    CommonModule,
    DecimalPipe,
  ],
  templateUrl: './member-dashboard.html',
  styleUrls: ['./member-dashboard.scss'],
})
export class MemberDashboard {
  private common = inject(Common);
  private platformId = inject(PLATFORM_ID);

  memberEmail = '';
  memberId = '';
  memberIdNo = '';

  memberDeals: any[] = [];
  dataSource = new MatTableDataSource<any>([]);

  totalPaid = 0;
  totalCollection = 0;
  totalInterest = 0;
  message = '';

  walletAmount = 0;
  totalInstallments = 0;
  totalPaidAmount = 0;

  dateForm!: FormGroup;
  isFormReady = false; // ✅ KEY FIX

  page = 1;
  limit = 10;
  total = 0;
  cdr=inject(ChangeDetectorRef)

  installment$ = new BehaviorSubject<any[] | null>(null);
  collectionList: any[] = [];

  displayedColumns: string[] = [
    'dealIdNo',
    'tenureType',
    'tenureAmount',
    'tenureInstallment',
    'fromDate',
    'endDate',
    'lastPaidDate',
    'wallet',
    'status',
    'action',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
dashboard$ = new BehaviorSubject<{
  totalPaid: number;
  totalCollection: number;
  totalInterest: number;
  message: string;
}>({
  totalPaid: 0,
  totalCollection: 0,
  totalInterest: 0,
  message: ''
});


  // ================== INIT ==================

  ngOnInit() {
    this.dateForm = new FormGroup({
      fromDate: new FormControl(null),
      toDate: new FormControl(null),
    });

    if (!isPlatformBrowser(this.platformId)) return;

    this.memberEmail = localStorage.getItem('memberEmail') || '';
    if (!this.memberEmail) {
      this.logout();
      return;
    }

    // ✅ React ONLY after setup is done
    this.dateForm.valueChanges.subscribe(values => {
      if (
        this.isFormReady &&
        values.fromDate &&
        values.toDate &&
        this.memberId
      ) {
        this.loadDashboard();
      }
    });

    this.getMemberDetails();
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(event => {
      this.page = event.pageIndex + 1;
      this.limit = event.pageSize;
      this.updateTableData();
    });
  }

  // ================== MEMBER ==================

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

        this.memberId = member._id;        // Mongo ObjectId
        this.memberIdNo = member.memberIdNo;

        this.loadDashboard(); // ✅ first load
        this.getDeals();

        this.isFormReady = true; // ✅ enable date filter AFTER init
      },
      error: () => this.logout(),
    });
  }

  // ================== DASHBOARD ==================

  loadDashboard() {
  const { fromDate, toDate } = this.dateForm.value;

  const params: any = {
    type: 'overview',
    memberId: this.memberId
  };

  if (fromDate && toDate) {
    params.mode = 'custom';
    params.fromDate = this.withSystemTime(fromDate);
    params.toDate = this.withEndOfDay(toDate);
  }

  this.common.manualDashboard(params).subscribe({
    next: (res: any) => {
      const d = res?.data?.[0] || {};

      this.dashboard$.next({
        totalPaid: d.totalPaidAmount || 0,
        totalCollection: d.totalCollection || 0,
        totalInterest: d.totalInterestAmount || 0,
        message: res.message
      });
    },
    error: () => {
      this.dashboard$.next({
        totalPaid: 0,
        totalCollection: 0,
        totalInterest: 0,
        message: 'Failed'
      });
    }
  });
}


  // ================== DEALS ==================

  getDeals() {
    this.common.manualDeals(1, 1000).subscribe((res: any) => {
      const list = res?.list || [];

      this.memberDeals = list.filter(
       
        (d: any) => d.memberIdNo === this.memberIdNo
      );
       console.log('this.memberDeals', this.memberDeals)
      
      // console.log('',memberDeals)

      this.total = this.memberDeals.length;
      this.updateTableData();

        this.cdr.detectChanges()
    });
  }

  updateTableData() {
    const start = (this.page - 1) * this.limit;
    this.dataSource.data = this.memberDeals.slice(start, start + this.limit);
  }

  // ================== DATE HELPERS ==================

  withSystemTime(date: Date): string {
    const now = new Date();
    const d = new Date(date);
    d.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    return d.toISOString();
  }

  withEndOfDay(date: Date): string {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }

  // ================== MODAL ==================

  viewDocuments(dealId: string) {
    this.installment$.next([]);

    this.common.manualDealById(dealId).subscribe((res: any) => {
    this.collectionList = res
    this.installment$.next(res?.data?.interestHistory || []);
    this.totalInstallments = res?.data?.totalInstallmentsPaid || 0;
    this.totalPaidAmount = res?.data?.totalPaidAmount || 0;



    console.log('this.collectionList', this.collectionList)

    this.collectionList = [...(res?.data?.paidInstallments || [])];
    console.log('collectionList length:', this.collectionList.length);
     this.cdr.markForCheck();
  });
  }

  resetValues() {
    this.totalPaid = 0;
    this.totalCollection = 0;
    this.totalInterest = 0;
    this.message = 'No data available';
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      location.href = '/login';
    }
  }
}
