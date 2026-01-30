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

  investedAmount = 0;   // Σ tenureInstallment
  totalAmount = 0;      // Σ walletAmount.wallet
  interestAmount = 0;   // total - invested

  constructor(
    private common: Common,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCollections();
  }

  // 🔹 Load DEAL summary data
  loadCollections() {
    this.common.getDeal().subscribe({
      next: (res: any) => {
        this.collections = res.list || [];
        console.log('Collections:', this.collections);
        this.calculateAmounts();
      },
      error: () => this.resetAmounts(),
    });
  }

  // 🔹 CORE CALCULATION (FINANCE SAFE)
  calculateAmounts(): void {
    let invested = 0;
    let walletTotal = 0;

    this.collections.forEach((item: any) => {
      invested += Number(item.tenureInstallment || 0);
      walletTotal += Number(item.walletAmount?.wallet || 0);
    });

    this.investedAmount = invested;
    this.totalAmount = walletTotal;
    this.interestAmount = walletTotal - invested;

    this.cdr.detectChanges();

    console.log('Invested:', this.investedAmount);
    console.log('Total Wallet:', this.totalAmount);
    console.log('Interest:', this.interestAmount);
  }

  resetAmounts() {
    this.investedAmount = 0;
    this.totalAmount = 0;
    this.interestAmount = 0;
  }





}
