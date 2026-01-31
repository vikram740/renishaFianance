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
  styleUrls: ['./member-add-collection.scss'],
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
  id: any;
  agentId:any;
  installmentList:any
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
      installment: new FormControl(''),
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
    this.id = this.route.snapshot.paramMap.get('id');
    console.log('this.id', this.id)
    if (!this.id) {
      this.router.navigate(['/member-login']);
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      this.agentEmail = localStorage.getItem('agentEmail');
      this.role = localStorage.getItem('role');
      console.log('this.role', this.role)
      this.agentId = localStorage.getItem('agentMongoId')
      console.log('this.agentId', this.agentId)
    }

    this.getDealById(this.id);
    this.getPrimaryQr();
    this.getAllAgent();
    this.getInstallment()
  }

  // Fetch deal by ID
  getDealById(id: string) {
    this.common.getSingleDeal(id).subscribe((res: any) => {
      this.dealData = res.data;
      console.log('this.dealData', this.dealData)
      this.memberId = this.dealData.memberId;
      console.log('this.memberId', this.memberId)
      this.isMemberLoaded = true;

      this.getCollections();
      this.cdr.detectChanges();
      if (!this.dealData) {
        toast.error('Deal not found ❌');
        return;
      }
     const perInstallment = Number(this.dealData.tenureInstallment);

      this.paymentForm.patchValue({
        installment: 1,
        collectionAmount: perInstallment,
        collectionPercentage: this.dealData.percentage,
      });
    });
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

  getCollections() {
    this.common.getDealCollections().subscribe({
      next: (res: any) => {
        const list = res.list || [];
        console.log('list', list)

        const data = list.filter(
          (item: any) =>
            String(item.memberId?._id || item.memberId) === String(this.memberId) &&
            item.dealIdNo === this.dealData?.dealIdNo,
        );
        this.collectionData = Array.from(new Map(data.map((d: any) => [d._id, d])).values());
        this.cdr.detectChanges()

        console.log('FINAL DATA:', this.collectionData);
      },
      error: () => {
        this.collectionData = [];
      },
    });
  }

  getAllAgent() {
    this.common.getSingleAgent(this.agentId).subscribe((res: any) => {
      this.agentList = res.user || [];
      console.log('this.agentList', this.agentList)
      this.logedAgentId =  res.user.agentIdNo;
      this.agentName = res.user.agentName;
      this.agentById = res.user._id;
      console.log('this.agentById', this.agentById)
      
    });
  }

  getInstallment(){
    this.common.getDealInsallment(this.id).subscribe((res:any)=>{
      this.installmentList = res
      console.log('this.installmentList', this.installmentList)

    })

  }

  formatDateToDDMMYYYY(date: string): string {
    if (!date) return date;
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

  /* -------------------- SAVE -------------------- */

  save() {
    if (this.isSaving ||this.paymentForm.invalid || !this.isMemberLoaded || !this.dealData?._id) {
      this.paymentForm.markAllAsTouched();
      return;
    }
      this.isSaving = true;

    const formData = this.paymentForm.getRawValue();
    const payload = {
      dealId: this.id,
      memberId: this.memberId,
      agentId: this.agentById,
      paymentMode: formData.paymentMode,
      upiTransactionId:formData.upiTransactionId,
      installmentNumber: formData.installment,
      amount: Number(formData.collectionAmount),
      primaryQRCode: this.primaryQR?.qrId,
    };

    this.common.createDealCollection(payload).subscribe({
      next: (res) => {
        console.log('res', res);
        toast.success('Collection created successfully ✅');
        this.getCollections();
      },
      error: (err) => toast.error(err?.message || 'Failed ❌'),
    });
  }
}
