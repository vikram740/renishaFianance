import { Component } from '@angular/core';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-modal',
  imports: [MatDialogActions],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.scss',
})
export class ConfirmationModal {

   constructor(
    private dialogRef: MatDialogRef<ConfirmationModal>
  ) {}

   onConfirmClick(): void {
    this.dialogRef.close(true);
  }
  onCloseClick(): void {
    this.dialogRef.close(false);
  }

}
