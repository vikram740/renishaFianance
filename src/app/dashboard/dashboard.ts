import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Common } from '../service/common';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
  DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

  
  collections: any[] = [];
  filteredCollections:any[]=[];

  investedAmount = 0;   // 💰 total amount invested
  interestAmount = 0;   // 📈 total compound interest
  totalAmount = 0;      // 🧮 invested + interest

  constructor(
    private common: Common,
    private cdr: ChangeDetectorRef
  ) {}

   dateForm = new FormGroup({
    fromDate: new FormControl(null),
    toDate: new FormControl(null),
  });

 ngOnInit() {
    this.loadCollections();

    // 🔄 Auto recalc when date changes
    this.dateForm.valueChanges.subscribe(() => {
      this.applyDateFilter();
    });
  }

  loadCollections() {
    this.common.getDealCollections().subscribe({
      next: (res: any) => {
        this.collections = res.list || [];
        this.applyDateFilter(); // ⬅ important
      },
      error: () => this.resetAmounts(),
    });
  }

  applyDateFilter(): void {
  const { fromDate, toDate } = this.dateForm.value;

  if (!fromDate || !toDate) {
    this.filteredCollections = [...this.collections];
    this.calculateWallet(this.filteredCollections);
    return;
  }

  // ✅ FORCE DATE CONVERSION
  const start = new Date(fromDate + 'T00:00:00');
  const end = new Date(toDate + 'T23:59:59');

  console.log('FROM:', start);
  console.log('TO:', end);

  this.filteredCollections = this.collections.filter((item: any) => {
    if (!item.createdAt) return false;

    const created = new Date(item.createdAt).getTime();
    return created >= start.getTime() && created <= end.getTime();
  });

  console.log('Filtered:', this.filteredCollections.length);

  this.calculateWallet(this.filteredCollections);
}


  calculateWallet(list: any[]): void {
    let invested = 0;
    let interest = 0;

    list.forEach(item => {
      invested += Number(item.amount || 0);
      interest += Number(item.compoundInterest || 0);
    });

    this.investedAmount = +invested.toFixed(2);
    this.interestAmount = +interest.toFixed(2);
    this.totalAmount = +(invested + interest).toFixed(2);

    this.cdr.detectChanges();

    console.log('Invested:', this.investedAmount);
    console.log('Interest:', this.interestAmount);
    console.log('Total:', this.totalAmount);
  }

  resetAmounts() {
    this.investedAmount = 0;
    this.interestAmount = 0;
    this.totalAmount = 0;
  }





}
