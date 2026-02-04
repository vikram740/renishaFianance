import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as CryptoJS from 'crypto-js';
import { Common } from '../service/common';
import { environment, renishaFinance } from '../../environments/environment.development';

@Component({
  selector: 'app-payments',
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.html',
  styleUrls: ['./payments.scss'],
})
export class Payments {
  private platformId = inject(PLATFORM_ID);
  private common = inject(Common);

  qrList: any[] = [];
  activeQR: any | null = null;
  selectedQR: any | null = null;

  selectedFile: File | null = null;
  fileInputRef!: HTMLInputElement;

  enteredPassword = '';
  passwordError = false;

  pendingAction: 'upload' | 'setPrimary' | 'delete' | null = null;

  pendingQR: string | null = null;

  confirmTitle = '';
  confirmMessage = '';
  cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.getAllQr();
  }

  /* ---------------- HELPERS ---------------- */
  mapQr(qr: any) {
    return {
      id: qr._id,
      qrCodeIdNo: qr.qrCodeIdNo,
      qrCodeFileName: qr.qrCodeFileName,
      isPrimary: qr.isPrimary === true || qr.isPrimary === 'true',
      createdOn: qr.createdOn,
      url: environment.uploadUrl.replace(/\/$/, '') + '/uploads/' + qr.qrCodeFile,
    };
  }

  /* ---------------- API ---------------- */
  getAllQr() {
    this.common.getAllQr().subscribe((res: any) => {
      this.qrList = (res.list || []).map((q: any) => this.mapQr(q));
      // Set activeQR: first primary or first item
      this.activeQR = this.qrList.find((q) => q.isPrimary) || this.qrList[0] || null;
      this.cdr.detectChanges();

      console.log('QR List', this.qrList);
    });
  }

  /* ---------------- VIEW ---------------- */
  viewQr(qr: any) {
    this.selectedQR = {
      name: qr.qrCodeFileName,
      image: qr.url,
    };

    console.log('Selected QR', this.selectedQR);

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        import('bootstrap').then((bootstrap) => {
          const modalEl = document.getElementById('qrModal');
          if (!modalEl) return;

          const modal = new bootstrap.Modal(modalEl);
          modal.show();
        });
      });
    }
  }

  /* ---------------- UPLOAD ---------------- */
  requestUpload(input: HTMLInputElement) {
    this.fileInputRef = input;
    this.pendingAction = 'upload';
    this.openAdminModal();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    this.confirmTitle = 'Confirm Upload';
    this.confirmMessage = 'Do you want to upload this QR?';
    this.openModal('confirmModal');
    event.target.value = '';
  }

  /* ---------------- PRIMARY ---------------- */
  requestPrimaryChange(qr: any) {
    if (qr.isPrimary) return; // Already primary

    this.pendingAction = 'setPrimary';
    this.pendingQR = qr.id; // Only ID
    this.confirmTitle = 'Set Primary QR';
    this.confirmMessage = `Set "${qr.qrCodeFileName}" as primary?`;
    this.openAdminModal(); // ask for admin password
  }
  requestDelete(qr: any) {
    this.pendingAction = 'delete';
    this.pendingQR = qr.id;
    this.confirmTitle = 'Delete QR';
    this.confirmMessage = `Are you sure you want to delete "${qr.qrCodeFileName}"?`;
    this.openAdminModal();
  }

  /* ---------------- CONFIRM ---------------- */
  confirmAction() {
    if (this.pendingAction === 'upload' && this.selectedFile) {
      this.common.createQr(this.selectedFile).subscribe((res: any) => {
        const newQr = this.mapQr(res.data);
        this.qrList.unshift(newQr);
        if (!this.activeQR) this.activeQR = newQr;
        this.closeModal('confirmModal');
        this.getAllQr();
        this.reset();
      });

      return;
    }

    if (this.pendingAction === 'setPrimary' && this.pendingQR) {
      this.common.setPrimary(this.pendingQR).subscribe({
        next: (res: any) => {
          console.log('Primary QR updated on server', res);
          this.cdr.detectChanges();
          this.getAllQr(); // Refresh QR list from backend
          this.closeModal('confirmModal');
          this.reset();
        },
        error: (err) => console.error('Failed to set primary', err),
      });
      return;
    }
    if (this.pendingAction === 'delete' && this.pendingQR) {
      this.common.deleteQr(this.pendingQR).subscribe({
        next: () => {
          this.qrList = this.qrList.filter((q) => q.id !== this.pendingQR);
          this.activeQR = this.qrList.find((q) => q.isPrimary) || this.qrList[0] || null;

          this.closeModal('confirmModal');
          this.reset();
          this.getAllQr();
        },
        error: (err) => console.error('Delete failed', err),
      });
      return;
    }
  }

  /* ---------------- ADMIN ---------------- */
  verifyAdmin() {
    const storedHash = localStorage.getItem('adminPassword');
    const enteredHash = CryptoJS.MD5(this.enteredPassword).toString();

    if (!storedHash || storedHash !== enteredHash) {
      this.passwordError = true;
      return;
    }

    this.passwordError = false;
    this.closeModal('adminModal');

    if (this.pendingAction === 'upload') {
      setTimeout(() => this.fileInputRef.click(), 200);
    }

    if (this.pendingAction === 'setPrimary') {
      this.openModal('confirmModal');
    }
    if (this.pendingAction === 'setPrimary' || this.pendingAction === 'delete') {
      this.openModal('confirmModal'); // ✅ FIX
    }
  }

  /* ---------------- MODALS ---------------- */
  openAdminModal() {
    this.enteredPassword = '';
    this.passwordError = false;
    this.openModal('adminModal');
  }

  openModal(id: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    import('bootstrap').then((bs) => {
      const el = document.getElementById(id);
      if (el) {
        const modal = bs.Modal.getOrCreateInstance(el);
        modal.show();
      }
    });
  }

  closeModal(id: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    import('bootstrap').then((bs) => {
      const el = document.getElementById(id);
      if (el) {
        const modal = bs.Modal.getOrCreateInstance(el);
        modal.hide();
      }
    });
  }

  reset() {
    this.pendingAction = null;
    this.pendingQR = null;
    this.selectedFile = null;
  }
}
