import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Common } from '../service/common';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-collection-agent',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './collection-agent.html',
  styleUrl: './collection-agent.scss',
})
export class CollectionAgent {
  agentForm!: FormGroup;
  submitted: boolean = false;
  common = inject(Common);

  ngOnInit() {
    this.agentForm = new FormGroup({
      agentName: new FormControl('', Validators.required),
      agentBirth: new FormControl('', Validators.required),
      agentAdhaar: new FormControl('', [Validators.required,Validators.pattern(/^[0-9]{12}$/)]),
      agentPhone: new FormControl('', [Validators.required, Validators.minLength(10)]),
      agentEmail: new FormControl('', [Validators.required, Validators.email]),
      agentPan: new FormControl('', [Validators.required]),
      agentCurrentAddress: new FormControl('', Validators.required),
      agentPermanentAddress: new FormControl('', Validators.required),
      agentSignature: new FormControl('', Validators.required),
      agentPhoto: new FormControl('', Validators.required),
      agentuserName: new FormControl('', Validators.required),
      agentPassword: new FormControl('', Validators.required),
    });
  }
  agentPhotoName: string | null = null;
  agentSignatureName: string | null = null;

  onFileSelected(event: Event, field: 'agentPhoto' | 'agentSignature') {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size should be less than 2MB');
      return;
    }

    this.agentForm.get(field)?.setValue(file);
    this.agentForm.get(field)?.markAsTouched();

    if (field === 'agentPhoto') {
      this.agentPhotoName = file.name;
    } else {
      this.agentSignatureName = file.name;
    }
  }

  removeFile(field: 'agentPhoto' | 'agentSignature') {
    this.agentForm.get(field)?.reset();

    if (field === 'agentPhoto') {
      this.agentPhotoName = null;
    } else {
      this.agentSignatureName = null;
    }
  }

  onSubmit() {
    if (this.agentForm.invalid) {
      this.submitted = true;
    }
    else{
      const formData = new FormData();
      const collectionAgent = this.agentForm.value;
      formData.append('agentName', collectionAgent.agentName);
      formData.append('agentBirth', collectionAgent.agentBirth);
      formData.append('agentAdhaar', collectionAgent.agentAdhaar);
      formData.append('agentPhone', collectionAgent.agentPhone);
      formData.append('agentEmail', collectionAgent.agentEmail);
      formData.append('agentPan', collectionAgent.agentPan);
      formData.append('agentCurrentAddress', collectionAgent.agentCurrentAddress);
      formData.append('agentPermanentAddress', collectionAgent.agentPermanentAddress);
      formData.append('agentSignature', collectionAgent.agentSignature);
      formData.append('agentPhoto', collectionAgent.agentPhoto);
      formData.append('agentuserName', collectionAgent.agentuserName);
      formData.append('agentPassword', collectionAgent.agentPassword);

      this.common.createCollectionAgent(formData).subscribe({
        next: (res: any) => {
          console.log(res);
          toast.success('createAgent Successfully', { class: 'toast-success' });
                  this.agentForm.reset();
                  this.submitted = false;
                   this.agentSignatureName = '';
                   this.agentPhotoName = '';
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }
}
