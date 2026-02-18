import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Common } from '../service/common';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { environment, renishaFinance } from '../../environments/environment.development';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-intrest-page',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './intrest-page.html',
  styleUrl: './intrest-page.scss',
})
export class IntrestPage {
  common = inject(Common);
  route = inject(ActivatedRoute);
  cdr = inject(ChangeDetectorRef);

  deal: any = {};
  memberDetails: any = null;
  dealId: any;

  collectionList: any = [];
  installments: any = [];
  profilePhoto: any;

  editingPaymentIndex: number | null = null;
  editingInterestIndex: number | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('dealId');

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      console.error('Invalid deal id');
      return;
    }

    this.dealId = id;
    console.log('this.dealId', this.dealId)
    this.getSingleDeal(id);
  }

  getSingleDeal(id: string) {
    this.common.manualDealById(id).subscribe((res: any) => {
      console.log('FULL RESPONSE', res);

      const dealData = res?.data || {};

      this.deal = dealData;

      this.collectionList = [...(dealData.paidInstallments || [])];
      this.installments = [...(dealData.interestHistory || [])];

      console.log('CollectionList After Assign:', this.collectionList);

      const memberId = dealData?.memberId;

      if (memberId) {
        this.getMember(memberId);
      }
      this.cdr.detectChanges();
    });
  }

  getMember(memberId: string) {
    this.common.getsingleMember(memberId).subscribe((res: any) => {
      this.memberDetails = res?.user || {};

      if (this.memberDetails?.memberPhoto) {
        this.profilePhoto = `${environment.uploadUrl}${renishaFinance.uploads}/${this.memberDetails.memberPhoto}`;
      }
      this.cdr.detectChanges();
    });
  }

  savePayment(index: number) {
    const updatedRow = this.collectionList[index];
    console.log('Saving Payment:', updatedRow);

    // TODO: call backend API here

    this.editingPaymentIndex = null;
  }

  // 🔥 Save Interest Row
  saveInterest(index: number) {
    const updatedRow = this.installments[index];

    if (!updatedRow?._id) {
      console.error('Interest row ID missing');
      return;
    }

    const payload = {
      dealId: this.dealId, // master deal id
      updates: [
        {
          interestHistoryId: updatedRow._id,
          newInterest: Number(updatedRow.interest),
        },
      ],
    };

    console.log('Sending Interest Update:', payload);

    this.common.updateIntrest(payload).subscribe({
      next: (res: any) => {
        console.log('Update Success:', res);

        // reload deal to get recalculated wallet + totals
        this.getSingleDeal(this.dealId);

        this.editingInterestIndex = null;
      },
      error: (err) => {
        console.error('Update Failed:', err);
      },
    });
  }

  cancelPayment() {
    this.editingPaymentIndex = null;
  }

  cancelInterest() {
    this.editingInterestIndex = null;
  }
}
