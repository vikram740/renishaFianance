import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Common } from '../service/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FormsModule } from '@angular/forms';
import { NumberToWordsPipe } from '../../number-to-words-pipe';
import { environment, renishaFinance } from '../../environments/environment.development';

@Component({
  selector: 'app-documents',
  imports: [CommonModule, FormsModule, NumberToWordsPipe],
  templateUrl: './documents.html',
  styleUrl: './documents.scss',
})
export class Documents {
  isInput: boolean = true;
  common = inject(Common);
  searchId: string = '';
  foundData: any = null;

  searchDownload() {
    if (!this.searchId.trim()) {
      alert('Enter Deal ID');
      return;
    }

    this.common.getDeals(1, 1000).subscribe((res: any) => {
      const list = res.list || [];
      console.log('list', list)
      const found = list.find((d: any) => d.dealIdNo?.toString() === this.searchId.trim());

      if (!found) {
        alert('Deal not found');
        return;
      }

      const mongoId = found._id;

      this.common.getSingleDeal(mongoId).subscribe((dealRes: any) => {
        const deal = dealRes.data;
        console.log('deal', deal)
        const memberId = deal.memberId?._id;

        this.common.getsingleMember(memberId).subscribe((memberRes: any) => {
          const member = memberRes.user;

          this.common.getAllNominees().subscribe((nomineeRes: any) => {
            const allNominees = nomineeRes.list || [];
            const detailNominee = allNominees.find((n: any) => n.memberId === memberId);

            this.foundData = {
              deal,
              member,
              detailNominee,
            };

            console.log('this.foundData', this.foundData);

            setTimeout(() => this.generatePDF(), 300); // or increase timeout if needed
          });
        });
      });
    });
  }

  getTenureInYears(): number {
    if (!this.foundData?.deal) return 0;

    const tenure = Number(this.foundData.deal.tenurePlan || 0);
    const type = this.foundData.deal.tenureType;

    // convert months to years
    if (type === 'Months') {
      return tenure / 12;
    }

    return tenure; // Years
  }

  getCompoundAmount(): number {
    if (!this.foundData?.deal) return 0;

    const P = Number(this.foundData.deal.tenureInstallment || 0); // Principal
    const R = Number(this.foundData.deal.percentage || 0) / 100; // Rate
    const T = this.getTenureInYears(); // Time in years
    const N = 12; // compounding monthly

    const A = P * Math.pow(1 + R / N, N * T);
    return Math.round(A);
  }

  getCompoundInterest(): number {
    const P = Number(this.foundData?.deal?.tenureInstallment || 0);
    const A = this.getCompoundAmount();
    return A - P;
  }
  getAllAmount(){
    const p = Number(this.foundData?.deal?.tenureAmount|| 0)
    const intrestAmount = this.getCompoundAmount();
    return p + intrestAmount
  }
 getImageUrl(fileName: string | null | undefined): string {
  return fileName
    ? `${environment.uploadUrl}${renishaFinance.uploads}/${fileName}`
    : 'assets/no-image.png';
}


  async generatePDF() {
    const element = document.getElementById('deed-template');
    if (!element) return;

    const images = Array.from(element.getElementsByTagName('img'));

    try {
      await Promise.all(images.map((img) => img.decode()));
    } catch (e) {
      console.warn('Image decode failed', e);
    }

    const scale = window.devicePixelRatio || 2;

    const canvas = await html2canvas(element, {
      scale: scale * 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      imageTimeout: 0,
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: false,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
    pdf.save(`Investment_Deed_${this.searchId}.pdf`);
  }
}
