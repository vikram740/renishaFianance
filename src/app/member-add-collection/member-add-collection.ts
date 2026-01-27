import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { Common } from '../service/common';
import { toast } from 'ngx-sonner';
import { Auth } from '../service/auth';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-member-add-collection',
  imports: [MatExpansionModule, ReactiveFormsModule, CommonModule, MatProgressSpinnerModule],
  templateUrl: './member-add-collection.html',
  styleUrl: './member-add-collection.scss',
})
export class MemberAddCollection implements OnInit {
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
      transactionId: new FormControl('', Validators.required),
      installment: new FormControl(''),
    });

    // Adjust TXID validators for payment mode
    this.paymentForm.get('paymentMode')?.valueChanges.subscribe((mode) => {
      const txCtrl = this.paymentForm.get('transactionId');
      if (mode === 'cash') {
        txCtrl?.clearValidators();
        txCtrl?.setValue('CASH');
      } else {
        txCtrl?.setValidators(Validators.required);
        txCtrl?.setValue('');
      }
      txCtrl?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/member-login']);
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      this.agentEmail = localStorage.getItem('agentEmail');
    }

    this.getDealById(id);
    this.getPrimaryQr();
    this.getAllAgent();
  }

  // Fetch deal by ID
  getDealById(id: string) {
    this.common.getSingleDeal(id).subscribe((res: any) => {
      this.dealData = res.data;

      if (!this.dealData) {
        toast.error('Deal not found ❌');
        return;
      }

      this.getMemberByMemberIdNo(this.dealData.memberIdNo);

      this.memberData = {
        _id: this.dealData.memberId,
        memberIdNo: this.dealData.memberIdNo,
        memberName: this.dealData.memberName,
      };

      const perInstallment = Number(this.dealData.tenureInstallment);

      this.paymentForm.patchValue({
        installment: 1,
        collectionAmount: perInstallment,
        collectionPercentage: this.dealData.percentage,
      });
    });
  }

  // Fetch member by memberIdNo from getAllMember
  getMemberByMemberIdNo(memberIdNo: string) {
    this.common.getAllMember().subscribe({
      next: (res: any) => {
        const members = res.list || [];
        const member = members.find((m: any) => m.memberIdNo === memberIdNo);
        if (member) {
          this.memberId = member._id;
          console.log('this.memberId', this.memberId);
          this.isMemberLoaded = true;
          this.tryLoadCollections();
        } else {
          toast.error('Member not found ❌');
        }
      },
      error: () => toast.error('Failed to load members ❌'),
    });
  }

  tryLoadCollections() {
    if (this.isMemberLoaded && this.isQrLoaded) {
      this.getCollections();
    }
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
        this.tryLoadCollections();
      },
      error: () => {
        this.primaryQR = null;
        this.isQrLoaded = true;
        this.tryLoadCollections();
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

  getCollections() {
    this.common.getDealCollections().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res.list) ? res.list : [];
        console.log('list', list);

        const data = list.filter(
          (item: any) =>
            String(item.memberId) === String(this.memberId) &&
            String(item.dealIdNo) === String(this.dealData?.dealIdNo),
        );
        console.log('data', data);

        const qrId = this.primaryQR?.qrId;
        const agentId = data[0]?.agentNameId;

        if (!agentId) {
          this.collectionData = data.map((item: any) => ({
            ...item,
            qrId,
          }));

          this.cdr.markForCheck();
          return;
        }

        this.common.getAllAgents().subscribe((res: any) => {
          const agent = res.list || [];
          // console.log('agent', agent)
          const agentData = agent.find((i: any) => i.agentIdNo === agentId);
          // console.log('agentData', agentData)

          this.collectionData = data.map((item: any) => ({
            ...item,
            agentData,
          }));
          const nextInstallment = this.getNextInstallmentNumber();
          const perInstallment = Number(this.dealData?.tenureInstallment || 0);
          const walletDue = this.calculateWalletWithRollingInterest();

          this.paymentForm.patchValue({
            installment: nextInstallment,
            collectionAmount: perInstallment,
          });

          console.log('', this.collectionData);

          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.collectionData = [];
        this.cdr.markForCheck();
      },
    });
  }

  getAllAgent() {
    this.common.getAllAgents().subscribe((res: any) => {
      this.agentList = res.list || [];
      const agentEmail = this.getAgentEmailFromLocalStorage();
      if (!agentEmail) return;

      const selectedAgent = this.agentList.find((agent: any) => agent.agentEmail === agentEmail);
      if (selectedAgent) {
        this.logedAgentId = selectedAgent.agentIdNo;
        this.agentName = selectedAgent.agentName;
        this.agentById = selectedAgent._id;
      }
    });
  }

  getAgentEmailFromLocalStorage(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('agentEmail');
    }
    return null;
  }

  formatDateToDDMMYYYY(date: string): string {
    if (!date) return date;
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

  getNextInstallmentNumber(): number {
    if (!this.collectionData || this.collectionData.length === 0) {
      return 1;
    }

    const last = this.collectionData.reduce((a, b) =>
      a.installmentNumber > b.installmentNumber ? a : b,
    );

    return Number(last.installmentNumber || 0) + 1;
  }

   getCycleDays(type: string): number {
    switch ((type || '').toLowerCase()) {
      case 'daily': return 1;
      case 'weekly': return 7;
      case 'monthly': return 30;
      case 'yearly': return 365;
      default: return 1;
    }
  }

  getCyclesPassed(fromDate: string, tenureType: string): number {
    const start = new Date(fromDate).getTime();
    const now = Date.now();
    const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.floor(days / this.getCycleDays(tenureType));
  }

  // ✅ CORRECT COMPOUND INTEREST
  calculateCompoundInterest(amount: number, rate: number, cycles: number): number {
    return +(amount * (Math.pow(1 + rate / 100, cycles) - 1)).toFixed(2);
  }

   getPlanDays(type: string): number {
    switch ((type || '').toLowerCase()) {
      case 'daily': return 1;
      case 'weekly': return 7;
      case 'monthly': return 30;
      case 'quarterly': return 90;
      case 'half yearly':
      case 'half-yearly':
      case 'halfyearly': return 180;
      case 'yearly': return 365;
      default: return 1;
    }
  }

  calculateWalletWithRollingInterest(): number {
    const rate = Number(this.dealData?.percentage || 0);
    const cycleDays = this.getPlanDays(this.dealData?.tenureType);
    const dayMs = 24 * 60 * 60 * 1000;

    const payments = [...this.collectionData].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let wallet = 0;
    let lastTime = new Date(this.dealData?.fromDate).getTime();

    for (const p of payments) {
      const payTime = new Date(p.createdAt).getTime();
      const daysPassed = Math.floor((payTime - lastTime) / dayMs);
      const cycles = Math.floor(daysPassed / cycleDays);

      if (cycles > 0 && wallet > 0) {
        wallet = wallet * Math.pow(1 + rate / 100, cycles);
      }

      wallet += Number(p.amount || 0);
      lastTime = payTime;
    }

    const daysTillNow = Math.floor((Date.now() - lastTime) / dayMs);
    const cyclesTillNow = Math.floor(daysTillNow / cycleDays);

    if (cyclesTillNow > 0 && wallet > 0) {
      wallet = wallet * Math.pow(1 + rate / 100, cyclesTillNow);
    }

    return +wallet.toFixed(2);
  }

  /* -------------------- SAVE -------------------- */

  save() {
  if (this.paymentForm.invalid || !this.isMemberLoaded) {
    this.paymentForm.markAllAsTouched();
    return;
  }

  const formData = this.paymentForm.getRawValue();
  const amount = Number(formData.collectionAmount);
  const rate = Number(this.dealData?.percentage || 0);
  const installmentNumber = Number(formData.installment);

  // 🔹 WALLET BEFORE (principal + interest)
  const walletBefore = this.collectionData.reduce(
    (sum, i) =>
      sum + Number(i.amount || 0) + Number(i.compoundInterest || 0),
    0
  );

  // 🔹 INTEREST (starts from 2nd payment)
  const compoundInterest =
    installmentNumber === 1
      ? 0
      : +(walletBefore * (rate / 100)).toFixed(2);

  // 🔹 UNIQUE TRANSACTION ID
  const uniqueId = Date.now();
  const transactionId =
    formData.paymentMode === 'online'
      ? `${formData.transactionId}_${uniqueId}`
      : `CASH_${uniqueId}`;

  // 🔹 PAYLOAD
  const payload = {
    memberId: this.memberId,
    paymentMode: formData.paymentMode,
    upiTransactionId: transactionId,
    installmentNumber,
    amount,
    compoundInterest, // ✅ ONLY THIS MONTH’S INTEREST
    primaryQRCode: this.primaryQR?.qrId,
  };

  this.common.createDealCollection(payload).subscribe({
    next: () => {
      toast.success('Collection created successfully ✅');
      this.paymentForm.reset({
        paymentMode: 'online',
        transactionId: '',
        collectionAmount: amount,
      });
      this.getCollections();
    },
    error: (err) => toast.error(err?.message || 'Failed ❌'),
  });
}

}
