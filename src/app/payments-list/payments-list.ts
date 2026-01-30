import { ChangeDetectorRef, Component, inject, PLATFORM_ID } from '@angular/core';
import { ConfirmationModal } from '../confirmation-modal/confirmation-modal';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Common } from '../service/common';
import { toast } from 'ngx-sonner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-payments-list',
  imports: [MatPaginatorModule,DatePipe,CommonModule],
  templateUrl: './payments-list.html',
  styleUrl: './payments-list.scss',
})
export class PaymentsList {
  common = inject(Common);
  dialog = inject(MatDialog);
  cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  paymentsList: any[] = [];
  allPaymentsList: any[] = [];

  page = 1;
  limit = 10;
  totalCount = 0;
  role: any;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.role = localStorage.getItem('role');
    this.getCollections();
  }

  // ✅ GET COLLECTIONS
  getCollections() {
    this.common.getDealCollection(this.page, this.limit).subscribe((res: any) => {
      this.paymentsList = res.list;
      console.log('this.paymentsList', this.paymentsList)
      this.allPaymentsList = res.list;
      this.totalCount = res.count;
      this.cdr.detectChanges();
    });
  }

  // ✅ PAGINATION
  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.getCollections();
  }

  // ✅ SEARCH (MATCHES API RESPONSE)
  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value
      .toLowerCase()
      .trim();

    if (!value) {
      this.paymentsList = [...this.allPaymentsList];
      this.totalCount = this.allPaymentsList.length;
      return;
    }

    this.paymentsList = this.allPaymentsList.filter((d: any) =>
      d.dealIdNo?.toLowerCase().includes(value) ||
      d.memberIdNo?.toLowerCase().includes(value) ||
      d.memberName?.toLowerCase().includes(value) ||
      d.agentName?.toLowerCase().includes(value) ||
      d.paymentMode?.toLowerCase().includes(value) ||
      String(d.tenureInstallment).includes(value) ||
      String(d.installmentNumber).includes(value) ||
      d.transactionId?.toLowerCase().includes(value)
    );

    this.totalCount = this.paymentsList.length;
  }

  // ✅ DELETE
  openDialog(id: string) {
    const dialogRef = this.dialog.open(ConfirmationModal, {
      width: '400px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) this.deleteCollection(id);
    });
  }

  deleteCollection(id: string) {
    this.common.deleteCollection(id).subscribe(() => {
      toast.success('Payment deleted successfully',{class: 'toast-success'});
      this.getCollections();
    });
  }

  // ✅ EXPORT
  exportToExcel() {
    if (!this.paymentsList.length) {
      toast.error('No data to export');
      return;
    }

    const excelData = this.paymentsList.map((d, i) => ({
      'S.No': i + 1,
      'Deal No': d.dealIdNo,
      'Member ID': d.memberIdNo,
      'Member Name': d.memberName,
      'Agent': d.agentName,
      'Payment Mode': d.paymentMode,
      'Amount': d.tenureInstallment,
      'Installment No': d.installmentNumber,
      'Transaction ID': d.transactionId,
      'UPI TxID': d.upiTransactionId,
      'Date': d.createdAt,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { Payments: ws }, SheetNames: ['Payments'] };
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    saveAs(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `Payments_${Date.now()}.xlsx`
    );
  }



}
