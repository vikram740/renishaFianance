import { ChangeDetectorRef, Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Common } from '../service/common';
import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-manual-dashboard',
  imports: [ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatDatepickerModule,DecimalPipe],
  templateUrl: './manual-dashboard.html',
  styleUrl: './manual-dashboard.scss',
})
export class ManualDashboard {
  dateForm!: FormGroup;

  totalPaid = 0;
  totalOverallPaid = 0;
  totalCollection = 0;
  totalInterest = 0;
  message = '';
  cdr = inject(ChangeDetectorRef)

  constructor(
    private fb: FormBuilder,
    private common: Common,
     @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

 ngOnInit() {
  // 1️⃣ Create form
  this.dateForm = this.fb.group({
    fromDate: [null],
    toDate: [null],
  });

  // 2️⃣ Load OVERALL dashboard (no date)
 
   if (isPlatformBrowser(this.platformId)) {
    this.loadOverallDashboard();
     }

  // 3️⃣ Patch today WITHOUT triggering valueChanges
  this.patchToday(false);

  // 4️⃣ Subscribe to date changes
  
  this.dateForm.valueChanges.subscribe(({ fromDate, toDate }) => {
    if (isPlatformBrowser(this.platformId)) {
    if (fromDate && toDate) {
      this.loadPaidDashboard(fromDate, toDate);
    }
    }
  });


  // 5️⃣ Manually load TODAY paid dashboard ONCE
  const { fromDate, toDate } = this.dateForm.value;
  if (fromDate && toDate) {
    this.loadPaidDashboard(fromDate, toDate);
  }
}


  patchToday(emit = true) {
    const today = new Date();
    this.dateForm.patchValue(
      {
        fromDate: today,
        toDate: today,
      },
      { emitEvent: emit },
    );
  }

startOfDay(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

endOfDay(date: Date): string {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

  withEndOfDay(date: Date): string {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }

  loadOverallDashboard() {
    const params = { type: 'overview' };

    this.common.manualDashboard(params).subscribe((res: any) => {
      const data = res?.data?.[0] || {};
      this.totalOverallPaid = data.totalPaidAmount || 0;
      this.totalCollection = data.totalCollection || 0;
      this.totalInterest = data.totalInterestAmount || 0;
      this.cdr.detectChanges()
    });
  }

  /* 🔹 FILTERED PAID API CALL */
  loadPaidDashboard(fromDate: Date, toDate: Date) {
  const params = {
    type: 'overview',
    mode: 'custom',
    fromDate: this.startOfDay(fromDate),
    toDate: this.endOfDay(toDate),
  };

  this.common.manualDashboard(params).subscribe((res: any) => {
    const data = res?.data?.[0] || {};
    this.totalPaid = data.totalPaidAmount || 0;
    this.cdr.detectChanges();
    console.log('this.totalPaid', this.totalPaid);
  });
}


  resetValues() {
    this.totalPaid = 0;
    this.totalCollection = 0;
    this.totalInterest = 0;
    this.message = 'Failed to load dashboard';
  }

}
