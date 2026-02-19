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
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-members',
  imports: [
    MatPaginatorModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatProgressSpinnerModule,
    Signup,
    RouterLink
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
  selectedSignupData: any = null;
  role: any;
  auth = inject(Auth)
  // isLoading: boolean = false;

  @ViewChild('editModal') editModal!: ElementRef;

  ngOnInit() {
    this.generateID = new FormGroup({
      memberName: new FormControl('', Validators.required),
      memberBirth: new FormControl('', Validators.required),
      memberAdhaar: new FormControl('', [Validators.required]),
      memberPhone: new FormControl('', [Validators.required, Validators.minLength(10)]),
      memberEmail: new FormControl('', [Validators.required]),
      memberCurrentAddress: new FormControl('', Validators.required),
      memberPermanentAddress: new FormControl('', Validators.required),
    });

    this.role = this.auth.getRole();

    if (isPlatformBrowser(this.platformId)) {
      this.getMembersList();
    }
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
        memberName: formValue.memberName,
        memberPhone: formValue.memberPhone,
        memberEmail: formValue.memberEmail,
        memberCurrentAddress: formValue.memberCurrentAddress,
        memberPermanentAddress: formValue.memberPermanentAddress,
      };

      this.common.editMember(this.selectedMemberId, payload).subscribe((res: any) => {

        console.log('', res)
        this.editModalInstance.hide();
        document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove());
        document.body.classList.remove('modal-open');
        toast.success('Member details updated successfully', { class: 'toast-success' });
        this.getMembersList();
        this.submitted = false;
      });
    }
  }

  mapSignupData(name: string, email: string, role: string, password?: string) {
    const parts = name?.trim().split(' ') || [];
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      email,
      role,
      password: password ?? this.generatePassword(name),
    };
  }

  generatePassword(name: string): string {
    const firstPart = name
      ?.replace(/\s+/g, '')   // remove spaces
      ?.substring(0, 4)       // first 4 chars
      ?.toLowerCase() || 'user';

    const year = new Date().getFullYear();

    return `${firstPart}@${year}`;
  }

  openSignupComponent(member: any) {
    this.selectedSignupData = this.mapSignupData(
      member.memberName,
      member.memberEmail,
      'member'
    );

    this.openSignup = true;
    this.openModal('signupModal');
  }

  openModal(id: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    import('bootstrap').then((bs) => {
      const modalEl = document.getElementById(id);
      if (!modalEl) return;
      new bs.Modal(modalEl, { backdrop: 'static', keyboard: false }).show();
    });
  }

  closeModal() {
    if (!isPlatformBrowser(this.platformId)) return;

    import('bootstrap').then((bs) => {
      document.querySelectorAll('.modal.show').forEach((el: any) => {
        bs.Modal.getInstance(el)?.hide();
      });
      document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove());
      document.body.classList.remove('modal-open');
      this.openSignup = false;
    });
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


}
