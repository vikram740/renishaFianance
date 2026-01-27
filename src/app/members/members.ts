import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { Common } from '../service/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { toast } from 'ngx-sonner';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NgModel,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModal } from '../confirmation-modal/confirmation-modal';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment, renishaFinance } from '../../environments/environment.development';
import { Signup } from '../signup/signup';
import { Auth } from '../service/auth';

@Component({
  selector: 'app-members',
  imports: [
    MatPaginatorModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatProgressSpinnerModule,
    Signup,
  ],
  templateUrl: './members.html',
  styleUrl: './members.scss',
  standalone: true,
})
export class Members implements OnInit {
  common = inject(Common);
  dialog = inject(MatDialog);
  membersList: any[] = [];
  generateID!: FormGroup;
  selectedMemberId!: string;
  page = 1;
  limit = 10;
  totalCount = 0;
  submitted: boolean = false;
  private platformId = inject(PLATFORM_ID);
  cdr = inject(ChangeDetectorRef);
  editModalInstance: any;
  searchText: string = '';
  allMembersList: any[] = [];
  selectedDocs: any;
  openSignup = false;
  role:any;
  auth=inject(Auth)
  // isLoading: boolean = false;

  @ViewChild('editModal') editModal!: ElementRef;

  ngOnInit() {
    this.generateID = new FormGroup({
      memberName: new FormControl('', Validators.required),
      memberBirth: new FormControl('', Validators.required),
      memberAdhaar: new FormControl('',[Validators.required]),
      memberPhone: new FormControl('', [Validators.required, Validators.minLength(10)]),
      memberEmail: new FormControl('', [Validators.required]),
      memberCurrentAddress: new FormControl('', Validators.required),
      memberPermanentAddress: new FormControl('', Validators.required),
    });
    
    this.role = this.auth.getRole();

    this.getMembersList();
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    if (this.searchText) {
      this.onSearch({ target: { value: this.searchText } } as any);
    } else {
      this.getMembersList();
    }
  }

  editMember(member: any) {
    this.selectedMemberId = member._id;
    console.log('this.selectedMemberId', this.selectedMemberId);

    this.generateID.patchValue({
      memberName: member.memberName,
      memberBirth: member.memberBirth,
      memberAdhaar: member.memberAdhaar,
      memberPhone: member.memberPhone,
      memberEmail: member.memberEmail,
      memberCurrentAddress: member.memberCurrentAddress,
      memberPermanentAddress: member.memberPermanentAddress,
    });

    this.generateID.get('memberAdhaar')?.disable();
    this.generateID.get('memberBirth')?.disable();

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        import('bootstrap').then((bootstrap) => {
          const modalEl = document.getElementById('editMemberModal');
          if (!modalEl) return;

          this.editModalInstance = new bootstrap.Modal(modalEl, {
            backdrop: 'static',
            keyboard: false,
          });

          this.editModalInstance.show();
        });
      });
    }
  }

  saveEdit() {
    this.submitted = true;
    if (this.generateID.invalid) {
      return;
    } else {
      const formValue = this.generateID.getRawValue();

      const payload = {
        _id: this.selectedMemberId,
        memberName: formValue.memberName,
        memberPhone: formValue.memberPhone,
        memberEmail: formValue.memberEmail,
        memberCurrentAddress: formValue.memberCurrentAddress,
        memberPermanentAddress: formValue.memberPermanentAddress,
      };

      this.common.editMember(payload).subscribe((res: any) => {
        console.log('res', res);
        this.editModalInstance.hide();
        document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove());
        document.body.classList.remove('modal-open');
        toast.success('Member details updated successfully', { class: 'toast-success' });
        this.getMembersList();
        this.submitted = false;
      });
    }
  }
  openSignupComponent() {
    this.openSignup = true;

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        import('bootstrap').then((bootstrap) => {
          const modalEl = document.getElementById('signupModal');
          if (!modalEl) return;

          const modal = new bootstrap.Modal(modalEl, {
            backdrop: 'static',
            keyboard: false,
          });

          modal.show();
        });
      });
    }
  }

  openDialog(memberId: string): void {
    const dialogRef = this.dialog.open(ConfirmationModal, {
      width: '400px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.deleteMember(memberId);
      } else {
        console.log('Dialog was closed without confirmation');
      }
    });
  }

  deleteMember(id: string) {
    this.common.deletemember(id).subscribe((res: any) => {
      console.log('res', res);
      toast.success('Member deleted successfully', { class: 'toast-success' });
      this.getMembersList();
    });
  }

  onSearch(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchText = searchValue;

    if (!searchValue) {
      this.membersList = [...this.allMembersList];
      return;
    }
    // this.isLoading = true;
    this.common.searchMember(searchValue, this.page, this.limit).subscribe({
      next: (res: any) => {
        this.membersList = res.list;
        this.totalCount = res.count;
        // this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        // this.isLoading = false;
        toast.error('Search failed');
      },
    });
  }

  viewDocuments(member: any) {
    const bsaeUrl = environment.uploadUrl + renishaFinance.uploads + '/';

    this.selectedDocs = {
      photo: member.memberPhoto ? bsaeUrl + member.memberPhoto : null,

      sign: member.memberSignature ? bsaeUrl + member.memberSignature : null,
      pan: member.uploadMemberPan ? bsaeUrl + member.uploadMemberPan : null,
      aadhar: member.uploadMemberAdhaar ? bsaeUrl + member.uploadMemberAdhaar : null,
    };
    console.log('this.selectedDocs', this.selectedDocs);

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        import('bootstrap').then((bootstrap) => {
          const modalEl = document.getElementById('documentViewModal');
          if (!modalEl) return;

          const modal = new bootstrap.Modal(modalEl);
          modal.show();
        });
      });
    }
  }

  exportToExcel() {
    if (!this.membersList || this.membersList.length === 0) {
      toast.error('No data to export');
      return;
    }

    const excelData = this.membersList.map((member, index) => ({
      'S.No': index + 1,
      'Member ID': member.memberIdNo,
      Name: member.memberName,
      Phone: member.memberPhone,
      Email: member.memberEmail,
      'Current Address': member.memberCurrentAddress,
      'Permanent Address': member.memberPermanentAddress,
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

    const workbook: XLSX.WorkBook = {
      Sheets: { Members: worksheet },
      SheetNames: ['Members'],
    };

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, `Members_List_${Date.now()}.xlsx`);
  }

  getMembersList() {
    this.common.getAllMembers(this.page, this.limit).subscribe((res: any) => {
      this.allMembersList = res.list;
      this.membersList = res.list;
      this.totalCount = res.count;
      this.cdr.detectChanges();
      console.log('this.membersList', this.membersList);
    });
  }

  closeModal() {
    this.openSignup = false;

    if (isPlatformBrowser(this.platformId)) {
      import('bootstrap').then((bootstrap) => {
        document.querySelectorAll('.modal.show').forEach((modalEl: any) => {
          const instance = bootstrap.Modal.getInstance(modalEl);
          if (instance) {
            instance.hide();
          }
        });

        // Cleanup
        document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove());
        document.body.classList.remove('modal-open');
      });
    }
  }
}
