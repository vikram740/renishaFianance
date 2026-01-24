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

      // Auto-calculate amount based on installment
      this.paymentForm.get('installment')?.valueChanges.subscribe((val) => {
        const count = Number(val) || 0;
        const total = count * perInstallment;
        this.paymentForm.patchValue({ collectionAmount: total }, { emitEvent: false });
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

  // Auto-create collection on page load
  // autoCreateCollection() {
  //   if (!this.isMemberLoaded || !this.memberId) return;

  //   const payload = {
  //     memberId: this.memberId,
  //     paymentType: 'cash', // default to cash, backend requires it
  //     upiTransactionId: 'CASH', // default value for cash
  //   };

  //   console.log('Auto creating collection with payload:', payload);

  //   this.common.createDealCollection(payload).subscribe({
  //     next: (res) => {
  //       toast.success('Collection automatically created ✅');
  //       this.getCollections(); // refresh table
  //     },
  //     error: (err) => {
  //       toast.error(err?.message || 'Failed to create collection automatically ❌');
  //     }
  //   });
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

        const data = list.filter(
          (item: any) =>
            String(item.memberId) === String(this.memberId) &&
            String(item.dealIdNo) === String(this.dealData?.dealIdNo),
        );

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

        this.common.getAgentById(agentId).subscribe((res: any) => {
          const agent = res.user;

          this.collectionData = data.map((item: any) => ({
            ...item,
            agent,
            qrId,
          }));

          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.collectionData = [];
        this.cdr.markForCheck();
      },
    });
  }

  get isAdminRole() {
    this.role = this.authService.getRole();
    return this.role === 'agent' || this.role === 'admin';
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

  // Manual save collection
  save() {
    if (!this.isMemberLoaded) {
      toast.error('Member data not loaded yet ❌');
      return;
    }

    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const formData = this.paymentForm.getRawValue();
    const payload = {
      memberId: this.memberId,
      paymentMode: formData.paymentMode,
      upiTransactionId: formData.paymentMode === 'online' ? formData.transactionId : 'CASH',
      installmentNumber: Number(formData.installment),
      amount: Number(formData.collectionAmount),
    };

    this.common.createDealCollection(payload).subscribe({
      next: () => {
        toast.success('Collection created successfully ✅');

        this.paymentForm.reset({
          paymentMode: 'online',
          installment: 1,
          transactionId: '',
          collectionAmount: formData.collectionAmount,
        });

        this.getCollections();
      },
      error: (err) => {
        toast.error(err?.message || 'Failed to create collection ❌');
      },
    });
  }

  // ngAfterViewInit() {
  //   this.getCollections();
  // }
}
