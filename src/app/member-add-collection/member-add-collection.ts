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
        // Use dealId + memberId + timestamp for uniqueness
        const dealId = this.dealData?._id || 'DEAL';
        const memberId = this.memberId || 'MEM';
        const uniqueTxId = `${dealId}-${memberId}-CASH-${Date.now()}`;
        txCtrl?.setValue(uniqueTxId);
      } else {
        txCtrl?.setValidators(Validators.required);
        txCtrl?.setValue('');
      }
      txCtrl?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (!this.id) {
      this.router.navigate(['/member-login']);
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      this.agentEmail = localStorage.getItem('agentEmail');
      this.role = localStorage.getItem('role');
    }

    this.getDealById(this.id);
    this.getPrimaryQr();
    this.getAllAgent();
  }

  // Fetch deal by ID
  getDealById(id: string) {
    this.common.getSingleDeal(id).subscribe((res: any) => {
      this.dealData = res.data;
      console.log('this.dealData', this.dealData?._id);
      this.memberId = this.dealData.memberId?._id;

      this.getCollections();
      this.cdr.detectChanges();
      console.log('this.memberId', this.memberId);
      if (!this.dealData) {
        toast.error('Deal not found ❌');
        return;
      }

      // this.getMemberByMemberIdNo(this.memberId);

      // this.memberData = {
      //   _id: this.dealData.memberId,
      //   memberIdNo: this.dealData.memberIdNo,
      //   memberName: this.dealData.memberName,
      // };

      const perInstallment = Number(this.dealData.tenureInstallment);

      this.paymentForm.patchValue({
        installment: 1,
        collectionAmount: perInstallment,
        collectionPercentage: this.dealData.percentage,
      });
    });
  }

  // Fetch member by memberIdNo from getAllMember
  // getMemberByMemberIdNo(memberIdNo: string) {
  //   this.common.getAllMember().subscribe({
  //     next: (res: any) => {
  //       const members = res.list || [];
  //       console.log('members', members)
  //       const member = members.find((m: any) => m._id === this.memberId);
  //       console.log('member', member)
  //       if (member) {
  //         this.memberId = member._id;
  //         console.log('this.memberId', this.memberId);
  //         this.isMemberLoaded = true;
  //         this.tryLoadCollections();
  //       } else {
  //         toast.error('Member not found ❌');
  //       }
  //     },
  //     error: () => toast.error('Failed to load members ❌'),
  //   });
  // }

  // tryLoadCollections() {
  //   if (this.isMemberLoaded && this.isQrLoaded) {
  //     this.getCollections();
  //   }
  // }

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

        // ✅ ADD THIS
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
    this.common.getAllAgents().subscribe((res: any) => {
      this.agentList = res.list || [];
      const agentEmail = this.agentEmail;
      if (!agentEmail) return;

      const selectedAgent = this.agentList.find((agent: any) => agent.agentEmail === agentEmail);
      if (selectedAgent) {
        this.logedAgentId = selectedAgent.agentIdNo;
        this.agentName = selectedAgent.agentName;
        this.agentById = selectedAgent._id;
      }
    });
  }

  formatDateToDDMMYYYY(date: string): string {
    if (!date) return date;
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

  /* -------------------- SAVE -------------------- */

  save() {
    if (this.paymentForm.invalid || !this.isMemberLoaded || !this.dealData?._id) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const formData = this.paymentForm.getRawValue();
    const payload = {
      dealId: this.id,
      memberId: this.memberId,
      paymentMode: formData.paymentMode,
      upiTransactionId: formData.transactionId,
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
