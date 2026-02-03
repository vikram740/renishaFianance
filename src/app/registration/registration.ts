import { CommonModule, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Common } from '../service/common';
import { toast } from 'ngx-sonner';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-registration',
  imports: [ReactiveFormsModule, CommonModule, MatProgressSpinnerModule],
  templateUrl: './registration.html',
  styleUrl: './registration.scss',
})
export class Registration {
  generateID!: FormGroup;
  submitted: boolean = false;
  common = inject(Common);
  // isLoading: boolean = false;

  memberPhotoName: string = '';
  memberSignatureName: string = '';
  nomineePhotoName: string = '';
  nomineeSignatureName: string = '';
  memberPanFile!: File;
  memberPanName = '';
  memberAdhaarFile!: File;
  memberAdhaarName = '';
  memberPhotoFile!: File;
  memberSignatureFile!: File;
  nomineePhotoFile!: File;
  nomineeSignatureFile!: File;

  ngOnInit(): void {
    this.generateID = new FormGroup({
      member: new FormGroup({
        memberName: new FormControl('', Validators.required),
        memberBirth: new FormControl('', Validators.required),
        memberAdhaar: new FormControl('', [Validators.required, Validators.minLength(12)]),
        memberPhone: new FormControl('', [Validators.required, Validators.minLength(10)]),
        memberEmail: new FormControl('', [Validators.required]),
        memberCurrentAddress: new FormControl('', Validators.required),
        memberPermanentAddress: new FormControl('', Validators.required),
        memberSignature: new FormControl('', Validators.required),
        memberPhoto: new FormControl('', Validators.required),
        memberJoiningDate: new FormControl(
          new Date().toISOString().split('T')[0],
          Validators.required,
        ),

        memberPan: new FormControl('', Validators.required),
        uploadMemberAdhaar: new FormControl('', Validators.required),
        uploadMemberPan: new FormControl('', Validators.required),
      }),

      nominee: new FormGroup({
        nomineeName: new FormControl('', Validators.required),
        nomineeBirth: new FormControl('', Validators.required),
        nomineeAdhaar: new FormControl('', [Validators.required, Validators.minLength(12)]),
        nomineePhone: new FormControl('', [Validators.required, Validators.minLength(10)]),
        nomineeEmail: new FormControl('', [Validators.required]),
        nomineeCurrentAddress: new FormControl('', Validators.required),
        nomineePermanentAddress: new FormControl('', Validators.required),
        nomineeSignature: new FormControl('', Validators.required),
        nomineePhoto: new FormControl('', Validators.required),
        nomineeRelationship: new FormControl('', Validators.required),
      }),
    });
  }
  onFileSelected(event: any, type: string) {
    const file: File = event.target.files[0];
    if (!file) return;

    if (type === 'memberPhoto') {
      this.memberPhotoFile = file;
      this.memberPhotoName = file.name;

      const control = this.generateID.get('member.memberPhoto');
      control?.setValue(file);
      control?.markAsTouched();
    }
    if (type === 'uploadMemberAdhaar') {
      this.memberAdhaarFile = file;
      this.memberAdhaarName = file.name;

      const control = this.generateID.get('member.uploadMemberAdhaar');
      control?.setValue(file);
      control?.markAsTouched();
    }

    if (type === 'uploadMemberPan') {
      this.memberPanFile = file;
      this.memberPanName = file.name;

      const control = this.generateID.get('member.uploadMemberPan');
      control?.setValue(file);
      control?.markAsTouched();
    }

    if (type === 'memberSignature') {
      this.memberSignatureFile = file;
      this.memberSignatureName = file.name;

      const control = this.generateID.get('member.memberSignature');
      control?.setValue(file);
      control?.markAsTouched();
    }

    if (type === 'nomineePhoto') {
      this.nomineePhotoFile = file;
      this.nomineePhotoName = file.name;

      const control = this.generateID.get('nominee.nomineePhoto');
      control?.setValue(file);
      control?.markAsTouched();
    }

    if (type === 'nomineeSignature') {
      this.nomineeSignatureFile = file;
      this.nomineeSignatureName = file.name;

      const control = this.generateID.get('nominee.nomineeSignature');
      control?.setValue(file);
      control?.markAsTouched();
    }
  }

  removeFile(type: string) {
    if (type === 'memberPhoto') {
      this.memberPhotoFile = null as any;
      this.memberPhotoName = '';

      const control = this.generateID.get('member.memberPhoto');
      control?.reset();
      control?.markAsTouched();
    }

    if (type === 'memberSignature') {
      this.memberSignatureFile = null as any;
      this.memberSignatureName = '';

      const control = this.generateID.get('member.memberSignature');
      control?.reset();
      control?.markAsTouched();
    }

    if (type === 'nomineePhoto') {
      this.nomineePhotoFile = null as any;
      this.nomineePhotoName = '';

      const control = this.generateID.get('nominee.nomineePhoto');
      control?.reset();
      control?.markAsTouched();
    }
    if (type === 'uploadMemberAdhaar') {
      this.memberAdhaarFile = null as any;
      this.memberAdhaarName = '';

      const control = this.generateID.get('member.uploadMemberAdhaar');
      control?.reset();
      control?.markAsTouched();
    }

    if (type === 'uploadMemberPan') {
      this.memberPanFile = null as any;
      this.memberPanName = '';

      const control = this.generateID.get('member.uploadMemberPan');
      control?.reset();
      control?.markAsTouched();
    }

    if (type === 'nomineeSignature') {
      this.nomineeSignatureFile = null as any;
      this.nomineeSignatureName = '';

      const control = this.generateID.get('nominee.nomineeSignature');
      control?.reset();
      control?.markAsTouched();
    }
  }

  generateId() {
    if (this.generateID.invalid) {
      this.submitted = true;
      this.generateID.markAllAsTouched();
      // this.isLoading = false;
      toast.error('Registration Failed', { class: 'toast-error' });
      return;
    } else {
      // this.isLoading = true;
      const formData = new FormData();
      const member = this.generateID.value.member;
      const nominee = this.generateID.value.nominee;

      // MEMBER
      formData.append('memberName', member.memberName);
      formData.append('memberBirth', member.memberBirth);
      formData.append('memberAdhaar', member.memberAdhaar);
      formData.append('memberPhone', member.memberPhone);
      formData.append('memberEmail', member.memberEmail);
      formData.append('memberCurrentAddress', member.memberCurrentAddress);
      formData.append('memberPermanentAddress', member.memberPermanentAddress);
      formData.append('memberPan', member.memberPan);
      formData.append('memberJoiningDate', member.memberJoiningDate);
      formData.append('uploadMemberPan', this.memberPanFile);
      formData.append('uploadMemberAdhaar', this.memberAdhaarFile);

      // NOMINEE
      formData.append('nomineeName', nominee.nomineeName);
      formData.append('nomineeBirth', nominee.nomineeBirth);
      formData.append('nomineeAdhaar', nominee.nomineeAdhaar);
      formData.append('nomineePhone', nominee.nomineePhone);
      formData.append('nomineeEmail', nominee.nomineeEmail);
      formData.append('nomineeCurrentAddress', nominee.nomineeCurrentAddress);
      formData.append('nomineePermanentAddress', nominee.nomineePermanentAddress);
      formData.append('nomineeRelationship', nominee.nomineeRelationship);

      // FILES (same as backend keys)
      formData.append('memberPhoto', this.memberPhotoFile);
      formData.append('memberSignature', this.memberSignatureFile);
      formData.append('nomineePhoto', this.nomineePhotoFile);
      formData.append('nomineeSignature', this.nomineeSignatureFile);
      this.common.createMember(formData).subscribe((res: any) => {
        // this.isLoading = false;
        console.log('resgistration', res.data);
        toast.success('Registration Successfully', { class: 'toast-success' });
        this.generateID.reset();
        this.submitted = false;
        this.memberSignatureName = '';
        this.memberPhotoName = '';
        this.memberPanName = '';
        this.memberAdhaarName = '';
        this.nomineePhotoName = '';
        this.nomineeSignatureName = '';
      });
      // this.isLoading = false;
    }
  }
}
