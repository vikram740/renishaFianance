import { ChangeDetectorRef, Component, inject } from '@angular/core';
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

deals: any[] = [];        // from getAllDeals
  collections: any[] = []; // from getDealCollections

  totalAmount = 0;      // Σ walletAmount (deals)
  investedAmount = 0;   // Σ installmentPaidAmount (collections)
  interestAmount = 0;   // total - invested
  cdr =inject(ChangeDetectorRef)

  constructor(private common: Common) {}

  ngOnInit() {
    this.loadDeals();
    this.loadCollections();
  }

  // 🔹 1. Load ALL DEALS → TOTAL WALLET
  loadDeals() {
    this.common.getDeal().subscribe({
      next: (res: any) => {
        this.deals = res?.data?.list || [];

        // ✅ SUM OF ALL WALLET AMOUNTS
        this.totalAmount = this.deals.reduce(
          (sum: number, d: any) => sum + Number(d.walletAmount || 0),
          0
        );
          console.log('this.totalAmount', this.totalAmount)

        this.calculateInterest();
      },
      error: () => this.resetAmounts()
    });
  }

  // 🔹 2. Load DEAL COLLECTIONS → INVESTED
  loadCollections() {
    this.common.getDealCollections().subscribe({
      next: (res: any) => {
        this.collections = res?.list || [];
        console.log('this.collections', this.collections)

        // ✅ SUM OF ALL INSTALLMENTS PAID
        this.investedAmount = this.collections.reduce(
          (sum: number, c: any) => sum + Number(c.installmentPaidAmount || 0),
          0
        );
            console.log('this.investedAmount', this.investedAmount)

        this.calculateInterest();

  
      },
      error: () => this.resetAmounts()
    });
  }

  // 🔹 3. INTEREST = TOTAL - INVESTED
  calculateInterest() {
    this.interestAmount = this.totalAmount - this.investedAmount;
    this.cdr.detectChanges()
    console.log('this.interestAmount', this.interestAmount)
  }

  resetAmounts() {
    this.totalAmount = 0;
    this.investedAmount = 0;
    this.interestAmount = 0;
  }




}
