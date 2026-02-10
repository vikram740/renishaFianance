import { HttpClient } from '@angular/common/http';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Common } from '../service/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-manual-form',
  imports: [ReactiveFormsModule],
  templateUrl: './manual-form.html',
  styleUrl: './manual-form.scss',
})
export class ManualForm {
  manualForm!: FormGroup;
  submitting = false;

  private platformId = inject(PLATFORM_ID);
  common = inject(Common);

  adminId: string | null = null;

  // FILE STORE (matches multer fields)
  files: Record<string, File | null> = {
    memberPhoto: null,
    memberSignature: null,
    uploadMemberAdhaar: null,
    uploadMemberPan: null,
    nomineePhoto: null,
    nomineeSignature: null,
    agentPhoto: null,
    agentSignature: null
  };

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {
      this.adminId = localStorage.getItem('id');
    }

    this.manualForm = this.fb.group({

      /* MEMBER */
      memberName: ['', Validators.required],
      memberEmail: [''],
      memberPhone: ['', Validators.required],
      memberIdNo: [''],
      memberBirth: [''],
      memberAdhaar: ['', Validators.required],
      memberPan: [''],
      memberCurrentAddress: [''],
      memberPermanentAddress: [''],
      memberJoiningDate: [''],

      /* NOMINEE */
      nomineeName: [''],
      nomineeBirth: [''],
      nomineeAdhaar: [''],
      nomineePhone: [''],
      nomineeEmail: [''],
      nomineeCurrentAddress: [''],
      nomineePermanentAddress: [''],
      nomineeRelationship: [''],

      /* AGENT */
      agentIdNo: [''],
      agentName: ['', Validators.required],
      agentBirth: [''],
      agentEmail: [''],
      agentPhone: [''],
      agentAdhaar: ['', Validators.required],
      agentPan: [''],
      agentCurrentAddress: [''],
      agentPermanentAddress: [''],
      agentuserName: ['', Validators.required],
      agentPassword: ['', Validators.required],

      /* REFERRAL */
      referredAmount: [0],
      referredPaid: [0],
      referredPending: [0],

      /* DEAL */
      dealIdNo: [''],
      tenureType: ['weekly'],
      tenurePlan: [0],
      tenureAmount: ['', Validators.required],
      percentage: [0],
      tenureInstallment: ['', Validators.required],
      walletAmount: [0],
      fromDate: ['', Validators.required],
      endDate: ['', Validators.required],
      lastPaidDate: [''],
      lastInterestDate: [''],

      /* PAYMENT */
      paymentDate: ['', Validators.required],
      paymentMode: ['cash'],
      upiTransactionId: ['CASH'],
      transactionId: [''],
      installmentNumber: [1],
      installmentPaidAmount: ['', Validators.required],

      /* TOTALS */
      balanceAmount: [0],
      totalPaidAmount: [0],
      totalInstallmentsPaid: [1],

      adminId: ['']
    });

    // patch adminId
    this.manualForm.patchValue({ adminId: this.adminId });

    // auto-calc (safe even if user edits)
    this.manualForm.get('installmentPaidAmount')?.valueChanges.subscribe(val => {
      const paid = Number(val) || 0;
      const tenure = Number(this.manualForm.get('tenureAmount')?.value) || 0;

      this.manualForm.patchValue({
        walletAmount: paid,
        totalPaidAmount: paid,
        balanceAmount: tenure - paid
      }, { emitEvent: false });
    });
  }

  /* FILE HANDLER */
  onFileSelected(event: any, key: string) {
    const file = event.target.files?.[0];
    if (file) this.files[key] = file;
  }

  /* SUBMIT */
  submit() {
    if (this.manualForm.invalid) {
      this.manualForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formData = new FormData();

    // APPEND ONLY NON-EMPTY VALUES
    Object.entries(this.manualForm.value).forEach(([key, value]: any) => {
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });

    // APPEND FILES ONLY IF SELECTED
    Object.entries(this.files).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    this.common.createManualForm(formData).subscribe({
      next: (res: any) => {
        console.log('SUCCESS', res);
        this.manualForm.reset();
        this.submitting = false;

        // reset files
        Object.keys(this.files).forEach(k => this.files[k] = null);
      },
      error: (err) => {
        console.error(err);
        this.submitting = false;
      }
    });
  }
}
