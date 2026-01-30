import { ChangeDetectorRef, Component, inject, PLATFORM_ID } from '@angular/core';
import { ConfirmationModal } from '../confirmation-modal/confirmation-modal';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Common } from '../service/common';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { toast } from 'ngx-sonner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { environment, renishaFinance } from '../../environments/environment.development';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Signup } from '../signup/signup';

@Component({
  selector: 'app-agent-list',
  imports: [CommonModule,MatPaginatorModule,ReactiveFormsModule,Signup],
  templateUrl: './agent-list.html',
  styleUrl: './agent-list.scss',
})
export class AgentList {
   private common = inject(Common);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  dialog = inject(MatDialog);

  agents: any[] = [];
  allAgents: any[] = [];
  selectedDocs:any

  agentForm!: FormGroup;
  selectedAgentId: string = '';
  submitted = false;
  openSignup = false;

  page = 1;
  limit = 10;
  totalCount = 0;
  searchText = '';
  role: string | null = null;

  ngOnInit() {
     this.agentForm = new FormGroup({
      agentName: new FormControl('', Validators.required),
      agentBirth: new FormControl('', Validators.required),
      agentAdhaar: new FormControl('', Validators.required),
      agentPhone: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
      ]),
      agentEmail: new FormControl('', Validators.required),
      agentCurrentAddress: new FormControl('', Validators.required),
      agentPermanentAddress: new FormControl('', Validators.required),
    });
    this.getAgents();
  }

  /* -------- GET AGENTS -------- */
 getAgents() {
  this.common.getAllAgent(this.page, this.limit).subscribe({
    next: (res: any) => {
      this.agents = res.list || [];
      this.allAgents = [...this.agents];
      this.totalCount = res.count || 0;
      this.cdr.detectChanges();
    },
    error: () => {
      this.agents = [];
      this.totalCount = 0;
    }
  });
}

  /* -------- PAGINATION -------- */
onPageChange(event: any) {
  this.page = event.pageIndex + 1;
  this.limit = event.pageSize;

  if (this.searchText) {
    this.common.searchAgent(this.searchText, this.page, this.limit).subscribe({
      next: (res: any) => {
        this.agents = res.list || [];
        this.totalCount = res.count || 0;
      },
    });
  } else {
    this.getAgents();
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



  /* -------- SEARCH -------- */
 onSearch(event: Event) {
  const value = (event.target as HTMLInputElement).value.trim();
  this.searchText = value;

  this.page = 1; // reset pagination on search

  if (!value) {
    this.getAgents(); // load normal list
    return;
  }

  this.common.searchAgent(value, this.page, this.limit).subscribe({
    next: (res: any) => {
      this.agents = res.list || [];
      this.totalCount = res.count || 0;
    },
    error: () => {
      this.agents = [];
      this.totalCount = 0;
    },
  });
}

editAgent(agent: any) {
    this.selectedAgentId = agent._id;

    this.agentForm.patchValue({
      agentName: agent.agentName,
      agentBirth: agent.agentBirth,
      agentAdhaar: agent.agentAdhaar,
      agentPhone: agent.agentPhone,
      agentEmail: agent.agentEmail,
      agentCurrentAddress: agent.agentCurrentAddress,
      agentPermanentAddress: agent.agentPermanentAddress,
    });

    this.agentForm.get('agentAdhaar')?.disable();
    this.agentForm.get('agentBirth')?.disable();

    this.openModal('editAgentModal');
  }

  saveEdit() {
    this.submitted = true;
    if (this.agentForm.invalid) return;

    const payload = {
      _id: this.selectedAgentId,
      ...this.agentForm.getRawValue(),
    };

    this.common.editAgent(payload).subscribe(() => {
      toast.success('Agent updated successfully', { class: 'toast-success' });
      this.closeModal();
      this.getAgents();
      this.submitted = false;
    });
  }


  /* -------- DELETE -------- */
 openDialog(agentId: string) {
    const dialogRef = this.dialog.open(ConfirmationModal, {
      width: '400px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((confirm) => {
      if (confirm) {
        this.deleteAgent(agentId);
      }
    });
  }

  deleteAgent(agentId: string) {
    this.common.deleteAgent(agentId).subscribe(() => {
      toast.success('Agent deleted successfully', { class: 'toast-success' });
      this.getAgents();
    });
  }


  /* -------- EXPORT -------- */
  exportToExcel() {
    if (!this.agents.length) {
      toast.error('No data to export');
      return;
    }

    const data = this.agents.map((a, i) => ({
      'S.No': i + 1,
      'Agent ID': a.agentIdNo,
      Name: a.agentName,
      Email: a.agentEmail,
      Phone: a.agentPhone,
      Address: a.agentCurrentAddress,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = { Sheets: { Agents: ws }, SheetNames: ['Agents'] };
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    saveAs(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `Agent_List_${Date.now()}.xlsx`
    );
  }
  
     viewDocuments(agent: any) {
    const baseUrl = environment.uploadUrl + renishaFinance.uploads + '/';

    this.selectedDocs = {
      photo: agent.agentPhoto ? baseUrl + agent.agentPhoto : null,
      sign: agent.agentSignature ? baseUrl + agent.agentSignature : null,
    };

    this.openModal('documentViewModal');
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
        const instance = bs.Modal.getInstance(el);
        instance?.hide();
      });

      document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove());
      document.body.classList.remove('modal-open');
    });
  }

}
