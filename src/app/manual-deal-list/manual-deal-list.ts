import { ChangeDetectorRef, Component, inject, PLATFORM_ID } from '@angular/core';
import { Common } from '../service/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'ngx-sonner';
import { ConfirmationModal } from '../confirmation-modal/confirmation-modal';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manual-deal-list',
  imports: [MatPaginatorModule, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './manual-deal-list.html',
  styleUrl: './manual-deal-list.scss',
})
export class ManualDealList {
  common = inject(Common);
  dealForm!: FormGroup;
  dealList: any[] = [];
  private platformId = inject(PLATFORM_ID);
  selectedMemberId!: string;
  editModalInstance: any;
  searchText: string = '';
  allDealList: any[] = [];
  router = inject(Router);
  role: any;
  cdr = inject(ChangeDetectorRef);
  page = 1;
  limit = 10;
  totalCount = 0;
  submitted: boolean = false;
  dialog = inject(MatDialog);
  installment$ = new BehaviorSubject<any[] | null>(null);
  collectionList: any = [];
  totalInstallments = 0;
  totalPaidAmount = 0;
  ngOnInit() {
    //     this.dealForm = new FormGroup({
    //   dealIdNo: new FormControl(''),
    //   tenureType: new FormControl('', Validators.required),
    //   tenurePlan: new FormControl('', Validators.required),
    //   tenureAmount: new FormControl('', Validators.required),
    //   tenureInstallment: new FormControl('', Validators.required),
    //   percentage: new FormControl('', Validators.required),
    //   fromDate: new FormControl('', Validators.required),
    //   endDate: new FormControl('', Validators.required),
    //   agentNameId: new FormControl('', Validators.required),
    // });
    if (!isPlatformBrowser(this.platformId)) return;
    this.role = localStorage.getItem('role');
    this.getDeals();
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.getDeals();
  }

  getDeals() {
    this.common.manualDeals(this.page, this.limit).subscribe((res: any) => {
      this.allDealList = res;
      console.log('this.allDealList', this.allDealList);
      // this.dealList = res.list;
      this.dealList = res.list;
      console.log('this.dealList', this.dealList);
      this.totalCount = res.count;
      this.cdr.detectChanges();
    });
  }
  exportToExcel() {
    if (!this.dealList || this.dealList.length === 0) {
      toast.error('No data to export');
      return;
    }

    const excelData = this.dealList.map((d, index) => ({
      'S.No': index + 1,
      'Deal No': d.dealIdNo,
      'Member ID': d.memberIdNo,
      Name: d.memberName,
      'Tenure Type': d.tenureType,
      Plan: d.tenurePlan,
      Amount: d.tenureAmount,
      Installment: d.tenureInstallment,
      Percentage: d.percentage,
      'From Date': d.fromDate,
      'End Date': d.endDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = { Sheets: { Deals: worksheet }, SheetNames: ['Deals'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, `Deals_List_${Date.now()}.xlsx`);
  }
  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.searchText = value;

    if (!value) {
      this.dealList = [...this.allDealList];
      this.totalCount = this.allDealList.length;
      return;
    }

    const filtered = this.allDealList.filter(
      (d: any) =>
        d.dealIdNo?.toLowerCase().includes(value) ||
        d.memberIdNo?.toLowerCase().includes(value) ||
        d.memberName?.toLowerCase().includes(value) ||
        d.tenureType?.toLowerCase().includes(value) ||
        String(d.tenurePlan).includes(value) ||
        String(d.tenureAmount).includes(value) ||
        String(d.tenureInstallment).includes(value) ||
        String(d.percentage).includes(value),
    );

    this.dealList = filtered;
    this.totalCount = filtered.length;
  }

  openDialog(dealId: string): void {
    const dialogRef = this.dialog.open(ConfirmationModal, {
      width: '400px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.deleteDeal(dealId);
      } else {
        console.log('Dialog was closed without confirmation');
      }
    });
  }

  deleteDeal(id: string) {
    this.common.deleteDeal(id).subscribe((res: any) => {
      console.log('res', res);
      toast.success('Deals deleted successfully', { class: 'toast-success' });
      this.getDeals();
    });
  }

  viewDocuments(Id: string) {

    console.log('', Id)
    this.router.navigate(['/IntrestPage',Id]);
  }
}
