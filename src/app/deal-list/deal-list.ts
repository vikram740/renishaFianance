import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Common } from '../service/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-deal-list',
  imports: [MatPaginatorModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatProgressSpinnerModule,],
  templateUrl: './deal-list.html',
  styleUrl: './deal-list.scss',
})
export class DealList {
  common = inject(Common);
  dealForm!:FormGroup;
  dealList: any[] = [];
  private platformId = inject(PLATFORM_ID);
  selectedMemberId!: string;
  editModalInstance: any;
  searchText:string='';
  allDealList:any[]=[];
page = 1;
limit = 10;
totalCount = 0;
submitted:boolean=false;
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

  this.getDeals();
}

onPageChange(event: any) {
  this.page = event.pageIndex + 1;
  this.limit = event.pageSize;
  this.getDeals();
}

getDeals() {
  this.common.getDeals(this.page, this.limit).subscribe((res: any) => {
    this.allDealList = res.list;
    this.dealList = res.list;
    this.totalCount = res.count;
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

  const filtered = this.allDealList.filter((d: any) =>
    d.dealIdNo?.toLowerCase().includes(value) ||
    d.memberIdNo?.toLowerCase().includes(value) ||
    d.memberName?.toLowerCase().includes(value) ||
    d.tenureType?.toLowerCase().includes(value) ||
    String(d.tenurePlan).includes(value) ||
    String(d.tenureAmount).includes(value) ||
    String(d.tenureInstallment).includes(value) ||
    String(d.percentage).includes(value)
  );

  this.dealList = filtered;
  this.totalCount = filtered.length;
}




// editDeal(deal: any) {
//   this.selectedMemberId = deal._id;

//   this.dealForm.patchValue({
//     dealIdNo: deal.dealIdNo,
//     tenureType: deal.tenureType,
//     tenurePlan: deal.tenurePlan,
//     tenureAmount: deal.tenureAmount,
//     tenureInstallment: deal.tenureInstallment,
//     percentage: deal.percentage,
//     fromDate: deal.fromDate,
//     endDate: deal.endDate,
//     agentNameId: deal.agentNameId,
//   });

//   // Make Deal No readonly
//   this.dealForm.get('dealIdNo')?.disable();

//   if (isPlatformBrowser(this.platformId)) {
//     setTimeout(() => {
//       import('bootstrap').then((bootstrap) => {
//         const modalEl = document.getElementById('editDealModal');
//         if (!modalEl) return;

//         this.editModalInstance = new bootstrap.Modal(modalEl, {
//           backdrop: 'static',
//           keyboard: false,
//         });

//         this.editModalInstance.show();
//       });
//     });
//   }
// }

// saveDealEdit() {
//   this.submitted = true;

//   if (this.dealForm.invalid) {
//     return;
//   }

//   const formValue = this.dealForm.getRawValue();

//   const payload = {
//     _id: this.selectedMemberId,
//     tenureType: formValue.tenureType,
//     tenurePlan: formValue.tenurePlan,
//     tenureAmount: formValue.tenureAmount,
//     tenureInstallment: formValue.tenureInstallment,
//     percentage: formValue.percentage,
//     fromDate: formValue.fromDate,
//     endDate: formValue.endDate,
//     agentNameId: formValue.agentNameId,
//   };

//   this.common.editDeal(payload).subscribe((res: any) => {
//     this.editModalInstance.hide();
//     document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove());
//     document.body.classList.remove('modal-open');

//     toast.success('Deal updated successfully', { class: 'toast-success' });
//     this.getDeals(); // reload deals list
//     this.submitted = false;
//   });
// }

// closeModal() {
//   this.editModalInstance.hide();
//   document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove());
//   document.body.classList.remove('modal-open');
// }


}
