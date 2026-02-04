import { ChangeDetectorRef, Component, inject, PLATFORM_ID } from '@angular/core';
import { Common } from '../service/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-primar-qr-log',
  imports: [FormsModule, CommonModule],
  templateUrl: './primar-qr-log.html',
  styleUrls: ['./primar-qr-log.scss'],
})
export class PrimarQrLog {
  collectionData: any[] = [];
  qrList: string[] = [];
  selectedQr: any;
  filteredCollections: any[] = [];
  cdr = inject(ChangeDetectorRef);

  common = inject(Common);
  platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.getCollections();
  }

  getCollections() {
    this.common.getDealCollections().subscribe({
      next: (res: any) => {
        this.collectionData = Array.isArray(res.list) ? res.list : [];
        console.log('collectionData', this.collectionData);

        // Get unique QR codes
        this.qrList = [
        ...new Set(
          this.collectionData
            .map(c => c?.primaryQRCode)
            .filter(qr => qr)
        )
      ];

        const hasCash = this.collectionData.some((c) => !c.primaryQRCode);

        if (hasCash) {
          this.qrList.push('CASH');
        }

        this.cdr.detectChanges();
        console.log('this.qrList', this.qrList);

        // Default select first QR
        if (this.qrList.length > 0) {
          this.selectQr(this.qrList[0]);
        }
      },
      error: () => {
        this.collectionData = [];
      },
    });
  }

  selectQr(qr: string) {
    this.selectedQr = qr;

    if (qr === 'CASH') {
      this.filteredCollections = this.collectionData.filter((c) => !c.primaryQRCode);
      return;
    }

    this.filteredCollections = this.collectionData.filter((c) => c.primaryQRCode === qr);
  }

  getTotalAmount(): number {
    return this.filteredCollections.reduce((sum, t) => sum + Number(t.installmentPaidAmount), 0);
  }
}
