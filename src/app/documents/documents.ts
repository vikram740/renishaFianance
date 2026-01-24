import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Common } from '../service/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FormsModule } from '@angular/forms';
import { NumberToWordsPipe } from '../../number-to-words-pipe';

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

    // Step 1: Get all deals
    this.common.getDeals(1, 1000).subscribe((res: any) => {
      const list = res.list || [];

      // Match with entered ID (example: dealIdNo)
      const found = list.find((d: any) => d.dealIdNo?.toString() === this.searchId.trim());

      if (!found) {
        alert('Deal not found');
        return;
      }

      const mongoId = found._id;
      console.log('Found Mongo ID:', mongoId);

      // Step 2: Call single deal API using Mongo _id
      this.common.getSingleDeal(mongoId).subscribe((dealRes: any) => {
        const deal = dealRes.data;

        const memberId = deal.memberId;
        console.log('memberId', memberId)

        this.common.getsingleMember(memberId).subscribe((memberRes: any) => {
          const member = memberRes.user;


          this.common.getSingleNominee(memberId).subscribe((nomineeRes: any) => {
            const nominee = nomineeRes.user;

            this.foundData = {
             
              deal,
              member,
              nominee,
            };
             console.log('this.foundData', this.foundData)

            setTimeout(() => this.generatePDF(), 300);
          });
        });
      });
    });
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
