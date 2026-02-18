import { ChangeDetectorRef, Component, inject, PLATFORM_ID, ViewChild } from '@angular/core';
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
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { forkJoin } from 'rxjs';
import { environment, renishaFinance } from '../../environments/environment.development';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-member-login',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
  ],
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
  private platformId = inject(PLATFORM_ID);
  showTable = false;
  isLoading: boolean = false;
  memberDetails: any = null;
  memberNominee: any = null;
  isAdmin: boolean = false;
  profilePhoto: any;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    // this.getMembers();
    this.memberLoginForm = this.fb.group({
      memberId: new FormControl('', [Validators.required]),
    });

    if (isPlatformBrowser(this.platformId)) {
      const role = localStorage.getItem('role');
      this.isAdmin = role === 'admin';
    }
    this.setDisplayedColumns();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  enter() {
    if (this.memberLoginForm.invalid) {
      this.submitted = true;
      toast.error('Member ID is required');
      return;
    }

    const memberIdNo = this.memberLoginForm.value.memberId.trim();
    this.isLoading = true;

    forkJoin({
      members: this.common.getAllMember(),
      nominees: this.common.getAllNominees(),
      deals: this.common.getDeal(),
    }).subscribe({
      next: (res: any) => {
        const allMembers = res.members?.list || [];
        const allNominees = res.nominees?.list || [];
        const allDeals = res.deals?.list || [];

        // 🔹 Find Member
        const foundMember = allMembers.find((m: any) => m.memberIdNo === memberIdNo);

        if (!foundMember) {
          toast.error('Member not found');
          this.resetData();
          return;
        }
        if (foundMember?.memberPhoto) {
          this.profilePhoto =
            environment.uploadUrl + renishaFinance.uploads + '/' + foundMember.memberPhoto;
        }
        console.log('this.profilePhoto', this.profilePhoto);

        this.memberDetails = foundMember;
        const MemberId = this.memberDetails._id;

        // 🔹 Find Nominee
        this.memberNominee = allNominees.find((n: any) => n.memberId === MemberId);
        // 🔹 Filter Deals
        const filteredDeals = allDeals.filter((d: any) => d.memberIdNo === memberIdNo);

        this.showTable = true;
        this.dataSource.data = filteredDeals;
         this.isLoading = false;

        this.cdr.detectChanges();

       
      },
      error: () => {
        toast.error('Something went wrong');
        this.isLoading = false;
      },
    });
  }

  resetData() {
    this.memberDetails = null;
    this.memberNominee = null;
    this.showTable = false;
    this.isLoading = false;
  }

  setDisplayedColumns() {
    const baseColumns = [
      'dealIdNo',
      'memberIdNo',
      'memberName',
      'tenureType',
      'tenurePlan',
      'percentage',
      'tenureAmount',
      'walletAmount',
      'fromDate',
      'endDate'
    ];

    if (!this.isAdmin) {
      baseColumns.push('action');
    }

    this.displayedColumns = baseColumns;
  }

  payNow(deal: any) {
    this.router.navigate(['/memberAddCollection', deal._id]);
  }
}
