import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Common } from '../service/common';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
<<<<<<< HEAD
    DecimalPipe,
=======
>>>>>>> c4007492c7363b2c0fc45a954b3fb161b5460c31
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
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
  ) {}

 ngOnInit() {
  // 1️⃣ Create form
  this.dateForm = this.fb.group({
    fromDate: [null],
    toDate: [null],
  });

  // 2️⃣ Load OVERALL dashboard (no date)
  this.loadOverallDashboard();

  // 3️⃣ Patch today WITHOUT triggering valueChanges
  this.patchToday(false);

  // 4️⃣ Subscribe to date changes
  this.dateForm.valueChanges.subscribe(({ fromDate, toDate }) => {
    if (fromDate && toDate) {
      this.loadPaidDashboard(fromDate, toDate);
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

  loadOverallDashboard() {
    const params = { type: 'overview' };

    this.common.dashBoard(params).subscribe((res: any) => {
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
      fromDate: this.withSystemTime(fromDate),
      toDate: this.withEndOfDay(toDate),
    };

    this.common.dashBoard(params).subscribe((res: any) => {
      const data = res?.data?.[0] || {};
      this.totalPaid = data.totalPaidAmount || 0;
     this.cdr.detectChanges()
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
