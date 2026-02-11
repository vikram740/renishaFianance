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
  memberData: any;
  paymentForm: FormGroup;
  memberId = '';
  collectionData: any[] = [];
  role: any;
  selectedPercentage: any;
  showTxId = false;
  primaryQR: any = null;
  dealData: any;
  agentList: any;
  agentEmail: any;
  logedAgentId: any;
  agentName: any;
  isMemberLoaded = false;
  isQrLoaded = false;
  qrId: any;
  agentById: any;
  id: any;
  agentId: any;
  installmentList: any[] = [];
  isSaving = false;

  authService = inject(Auth);
  route = inject(ActivatedRoute);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private common: Common,
    private cdr: ChangeDetectorRef,
  ) {
    this.paymentForm = new FormGroup({
      collectionAmount: new FormControl('', Validators.required),
      paymentMode: new FormControl('online', Validators.required),
      upiTransactionId: new FormControl('', Validators.required),
      installment: new FormControl('', Validators.required),

      // ✅ ADD THESE
      interestAmount: new FormControl(0),
      transactionDate: new FormControl('', Validators.required),
    });

    // Adjust TXID validators for payment mode
    this.paymentForm.get('paymentMode')?.valueChanges.subscribe((mode) => {
      const txCtrl = this.paymentForm.get('upiTransactionId'); // ✅ FIXED

      if (!txCtrl) return;

      if (mode === 'cash') {
        txCtrl.clearValidators();

        // optional: auto-generate a readable CASH id
        const dealId = this.dealData?._id || 'DEAL';
        const memberId = this.memberId || 'MEM';
        txCtrl.setValue(`CASH-${dealId}-${memberId}-${Date.now()}`);
      } else {
        txCtrl.setValidators(Validators.required);
        txCtrl.setValue('');
      }

      txCtrl.updateValueAndValidity();
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.id = this.route.snapshot.paramMap.get('id');
    }

    console.log('this.id', this.id);
    if (!this.id) {
      this.router.navigate(['/member-login']);
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      this.agentEmail = localStorage.getItem('agentEmail');
      this.role = localStorage.getItem('role');
      console.log('this.role', this.role);
      this.agentId = localStorage.getItem('agentMongoId');
      console.log('this.agentId', this.agentId);
    }

    this.getDealById(this.id);
    this.getPrimaryQr();
    this.getAllAgent();
    this.getInstallment();
  }

  // Fetch deal by ID
  getDealById(id: string) {
    this.common.getSingleDeal(id).subscribe((res: any) => {
      this.dealData = res.data;
      console.log('this.dealData', this.dealData);
      this.memberId = this.dealData.memberId;
      console.log('this.memberId', this.memberId);
      this.isMemberLoaded = true;
      this.getInstallment();
      this.cdr.detectChanges();
      if (!this.dealData) {
        toast.error('Deal not found ❌');
        return;
      }
      // const perInstallment = Number(this.dealData.tenureInstallment);

      // this.paymentForm.patchValue({
      //   installment: 1,
      //   collectionAmount: perInstallment,
      //   collectionPercentage: this.dealData.percentage,
      // });
    });
  }
  updateNextInstallment(): void {
    if (!this.dealData) return;

    const totalInstallments = Number(this.dealData.tenurePlan);
    const paidCount = Number(this.dealData.totalInstallmentsPaid || 0);
    const perInstallment = Number(this.dealData.tenureInstallment);
    const totalAmount = Number(this.dealData.tenureAmount);
    const paidAmount = Number(this.dealData.totalPaidAmount || 0);
    const walletAmount = Number(this.dealData.walletAmount || 0);
  const percentage = Number(this.dealData.percentage || 0);

  const calculatedAmount = (walletAmount * percentage) / 100;

    // ✅ All installments completed
    if (paidCount >= totalInstallments) {
      toast.info('All installments completed 🎉');
      this.paymentForm.disable({ emitEvent: false });
      return;
    }

    // ✅ Next installment number
    const nextInstallmentNumber = paidCount + 1;

    // ✅ Remaining amount (important for last installment)
    const remainingAmount = totalAmount - paidAmount;

    const nextAmount =
      nextInstallmentNumber === totalInstallments ? remainingAmount : perInstallment;

    // ✅ Patch form
    this.paymentForm.patchValue(
      {
        installment: nextInstallmentNumber,
        collectionAmount: nextAmount,
        interestAmount:calculatedAmount
      },
      { emitEvent: false },
    );
  }

  getPrimaryQr() {
    this.common.getAllQr().subscribe({
      next: (res: any) => {
        const list = res.list || [];
        const primary = list.find((q: any) => q.isPrimary === true || q.isPrimary === 'true');

        this.primaryQR = primary
          ? {
              name: primary.qrCodeFileName,
              url: primary.qrCodeFile
                ? `${environment.uploadUrl.replace(/\/$/, '')}/uploads/${primary.qrCodeFile}`
                : null,
              qrId: primary.qrCodeIdNo,
            }
          : null;

        this.isQrLoaded = true;
        this.primaryQR?.qrId;

        this.cdr.detectChanges();
      },
      error: () => {
        this.primaryQR = null;
        this.isQrLoaded = true;
        this.cdr.detectChanges(); // ✅ here also
      },
    });
  }

  openQr() {
    this.showTxId = false;
    if (!this.primaryQR?.url) {
      toast.error('QR Image not available ❌');
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      import('bootstrap').then((bootstrap) => {
        const modalEl = document.getElementById('qrModal');
        if (!modalEl) return;
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      });
    }
  }

  onQrClosed() {
    this.showTxId = true;
    document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove());
    document.body.classList.remove('modal-open');
  }

  getAllAgent() {
    this.common.getSingleAgent(this.agentId).subscribe((res: any) => {
      this.agentList = res.user || [];
      console.log('this.agentList', this.agentList);
      this.logedAgentId = res.user.agentIdNo;
      this.agentName = res.user.agentName;
      this.agentById = res.user._id;
      console.log('this.agentById', this.agentById);
    });
  }

  getInstallment() {
    this.common.getDealInsallment(this.id).subscribe((res: any) => {
      console.log('INSTALLMENT API FULL RESPONSE:', res);
      this.installmentList = res.installments || res.data || [];
      if (this.dealData) {
        this.updateNextInstallment();
      }
      this.cdr.detectChanges();
    });
  }

  // getDealCollection(){
  //   this.common
  // }

  formatDateToDDMMYYYY(date: string): string {
    if (!date) return date;
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

  /* -------------------- SAVE -------------------- */

  save() {
    if (this.isSaving || this.paymentForm.invalid || !this.isMemberLoaded || !this.dealData?._id) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;

    const formData = this.paymentForm.getRawValue();
    const hasInterest = Number(formData.interestAmount) > 0;

    const transactionType = hasInterest ? 'BOTH' : 'PAYMENT';
    const payload = {
      dealId: this.id,
      agentId: this.agentById,

      transactionType, // ✅ REQUIRED

      amount: Number(formData.collectionAmount),
      installmentNumber: Number(formData.installment),

      paymentMode: formData.paymentMode,
      upiTransactionId: formData.paymentMode === 'online' ? formData.upiTransactionId : 'CASH',

      transactionDate: formData.transactionDate,

      // ✅ INTEREST
      interestAmount: Number(formData.interestAmount) || 0,
      interestDate: formData.transactionDate,

      primaryQRCode: formData.paymentMode === 'online' ? this.primaryQR?.qrId : null,
    };

    this.common.createManualCollection(payload).subscribe({
      next: (res) => {
        console.log('res', res);
        toast.success('Collection created successfully ✅');
        this.isSaving = false;
        this.openSuccessModal();
        this.getInstallment();
      },
      error: (err) => toast.error(err?.message || 'Failed ❌'),
    });
  }
  openSuccessModal() {
    if (isPlatformBrowser(this.platformId)) {
      import('bootstrap').then((bootstrap) => {
        const modalEl = document.getElementById('successModal');
        if (!modalEl) return;
        const modal = new bootstrap.Modal(modalEl, { backdrop: 'static' });
        modal.show();
      });
    }
  }

  onSuccessOk() {
    // Close modal manually
    document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove());
    document.body.classList.remove('modal-open');

    // Redirect to member login
    this.router.navigate(['/memberLogin']);
  }
}
