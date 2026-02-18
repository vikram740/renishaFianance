import { ChangeDetectorRef, Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toast } from 'ngx-sonner';
import { Common } from '../service/common';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment.development';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../service/auth';

@Component({
  selector: 'app-manual-collection',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './manual-collection.html',
  styleUrl: './manual-collection.scss',
})
export class ManualCollection {
  dealData: any;
  installmentList: any[] = [];

  memberId = '';
  agentMongoId: any;
  agentName: any;
  agentIdNo: any;
  role: any;

  isMemberLoaded = false;
  isSaving = false;
  id: any;

  route = inject(ActivatedRoute);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private common: Common,
    private cdr: ChangeDetectorRef,
  ) {
    this.paymentForm = new FormGroup({
      collectionAmount: new FormControl('', Validators.required),
      transactionType: new FormControl('PAYMENT', Validators.required),
      installment: new FormControl('', Validators.required),
      interestAmount: new FormControl({ value: 0, disabled: true }), // 🔥 auto
      transactionDate: new FormControl('', Validators.required),
    });
  }

  paymentForm!: FormGroup;

  /* -------------------- INIT -------------------- */

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.id = this.route.snapshot.paramMap.get('id');
      this.agentMongoId = localStorage.getItem('agentMongoId');
      this.role = localStorage.getItem('role');
    }

    if (!this.id) {
      this.router.navigate(['/member-login']);
      return;
    }
    this.paymentForm.get('transactionType')?.valueChanges.subscribe((type) => {
      const amountCtrl = this.paymentForm.get('collectionAmount');
      const installmentCtrl = this.paymentForm.get('installment');
      const interestCtrl = this.paymentForm.get('interestAmount');

      if (type === 'PAYMENT') {
        amountCtrl?.enable();
        installmentCtrl?.enable();
        interestCtrl?.disable();

        amountCtrl?.setValidators([Validators.required]);
        installmentCtrl?.setValidators([Validators.required]);
        interestCtrl?.clearValidators();
      }

      if (type === 'INTEREST') {
        amountCtrl?.disable();
        installmentCtrl?.disable();
        interestCtrl?.enable();

        interestCtrl?.setValidators([Validators.required, Validators.min(1)]);
        amountCtrl?.clearValidators();
        installmentCtrl?.clearValidators();
      }

      if (type === 'BOTH') {
        amountCtrl?.enable();
        installmentCtrl?.enable();
        interestCtrl?.enable();

        amountCtrl?.setValidators([Validators.required]);
        installmentCtrl?.setValidators([Validators.required]);
        interestCtrl?.setValidators([Validators.required, Validators.min(1)]);
      }

      amountCtrl?.updateValueAndValidity();
      installmentCtrl?.updateValueAndValidity();
      interestCtrl?.updateValueAndValidity();
    });

    this.getAgentDetails();
    this.getDealById(this.id);
    this.getInstallment();
  }

  /* -------------------- GET AGENT -------------------- */

  getAgentDetails() {
    if (!this.agentMongoId) return;

    this.common.getSingleAgent(this.agentMongoId).subscribe((res: any) => {
      const agent = res.user;
      this.agentName = agent?.agentName;
      this.agentIdNo = agent?.agentIdNo;
      this.cdr.detectChanges();
    });
  }

  /* -------------------- GET DEAL -------------------- */

  getDealById(id: string) {
    this.common.getSingleDeal(id).subscribe((res: any) => {
      this.dealData = res.data;
      this.memberId = this.dealData.memberId;
      this.isMemberLoaded = true;

      // if (!this.paymentForm.get('transactionDate')?.value) {
      //   this.paymentForm.patchValue({
      //     transactionDate: this.formatDateInput(this.dealData.fromDate),
      //   });
      // }

      this.updateNextInstallment();
      this.cdr.detectChanges();
    });
  }

  /* -------------------- FORMAT DATE -------------------- */

  formatDateInput(date: string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  /* -------------------- INTEREST CALCULATION -------------------- */

  calculateInterest(): number {
    if (!this.dealData) return 0;

    const walletAmount = Number(this.dealData.walletAmount || 0);
    const percentage = Number(this.dealData.percentage || 0);

    return Number(((walletAmount * percentage) / 100).toFixed(2));
  }

  /* -------------------- DATE INCREMENT -------------------- */

  // calculateNextDate(currentDate: string): string {
  //   const date = new Date(currentDate);
  //   const type = this.dealData.tenureType?.toLowerCase();

  //   const daysMap: any = {
  //     daily: 1,
  //     weekly: 7,
  //     monthly: 28,
  //     quarterly: 90,
  //     halfyearly: 180,
  //     yearly: 365,
  //   };

  //   const addDays = daysMap[type] || 0;

  //   date.setDate(date.getDate() + addDays);

  //   return date.toISOString().split('T')[0];
  // }

  /* -------------------- NEXT INSTALLMENT -------------------- */

  updateNextInstallment(): void {
    if (!this.dealData) return;

    const totalInstallments = Number(this.dealData.tenurePlan);
    const paidCount = Number(this.dealData.totalInstallmentsPaid || 0);
    const perInstallment = Number(this.dealData.tenureInstallment);
    const totalAmount = Number(this.dealData.tenureAmount);
    const paidAmount = Number(this.dealData.totalPaidAmount || 0);

    if (paidCount >= totalInstallments || paidAmount >= totalAmount) {
      toast.success('All installments completed 🎉');

      this.paymentForm.disable({ emitEvent: false });

      // 🔥 Redirect after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/member-login']);
      }, 2000);

      return;
    }

    const nextInstallmentNumber = paidCount + 1;
    const remainingAmount = totalAmount - paidAmount;

    const nextAmount =
      nextInstallmentNumber === totalInstallments ? remainingAmount : perInstallment;

    this.paymentForm.patchValue(
      {
        installment: nextInstallmentNumber,
        collectionAmount: nextAmount,
        interestAmount: this.calculateInterest(),
      },
      { emitEvent: false },
    );
  }

  /* -------------------- INSTALLMENT HISTORY -------------------- */

  getInstallment() {
    this.common.getDealInsallment(this.id).subscribe((res: any) => {
      this.installmentList = res.installments || [];
      console.log('this.installmentList', this.installmentList);
      this.cdr.detectChanges();
    });
  }

  /* -------------------- SAVE -------------------- */

 save() {
  if (this.isSaving || this.paymentForm.invalid) {
    this.paymentForm.markAllAsTouched();
    return;
  }

  this.isSaving = true;

  const formData = this.paymentForm.getRawValue();

  const payload = {
    dealId: this.id,
    agentId: this.agentMongoId,
    transactionType: formData.transactionType,
    amount: Number(formData.collectionAmount || 0),
    installmentNumber: Number(formData.installment || 0),
    transactionDate: formData.transactionDate,
    interestAmount: Number(formData.interestAmount || 0),
    lastInterestDate: formData.transactionDate,
  };

  this.common.createManualCollection(payload).subscribe({
    next: () => {
      toast.success('Collection created successfully ✅');
      this.isSaving = false;

      this.getDealById(this.id);
      this.getInstallment();
    },
    error: (err) => {
      toast.error(err?.message || 'Failed ❌');
      this.isSaving = false;
    },
  });
}

}
