import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Common } from '../service/common';

@Component({
  selector: 'app-dashboard',
  imports: [MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

  collections: any[] = [];
  walletAmount = 0;
   

  constructor(private common: Common,private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadCollections();
  }

  loadCollections() {
    this.common.getDealCollections().subscribe({
      next: (res: any) => {
        this.collections = res.list || [];
        this.calculateWallet();
      },
      error: () => {
        this.walletAmount = 0;
      },
    });
  }

  calculateWallet(): void {
    // 🔐 Remove duplicates safely
    const uniqueCollections = Array.from(
      new Map(this.collections.map(item => [item._id, item])).values()
    );

    // ✅ Sum all amounts
    this.walletAmount = uniqueCollections.reduce(
      (total: number, item: any) => total + Number(item.amount || 0),
      0
    );
    this.cdr.detectChanges();

    console.log('Total Wallet Amount:', this.walletAmount);
  }





}
