import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Common } from '../service/common';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-referral-agent',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './referral-agent.html',
  styleUrl: './referral-agent.scss',
})
export class ReferralAgent {
  referralForm!: FormGroup;
  submitted = false;
  common = inject(Common);
  allAgents: any[] = [];

  ngOnInit() {
    this.referralForm = new FormGroup({
      referredAgentId: new FormControl('', Validators.required),
      referredName: new FormControl('', Validators.required),
      referredBirth: new FormControl('', Validators.required),
      referredPhone: new FormControl('', [Validators.required, Validators.minLength(10)]),
      referredEmail: new FormControl('', [Validators.required, Validators.email]),
      referredCurrentAddress: new FormControl('', Validators.required),
      referredPermanentAddress: new FormControl('', Validators.required),
      referredPlan: new FormControl('', Validators.required),
      referredAmount: new FormControl('', Validators.required),
      referredPaid: new FormControl('', Validators.required),
      referredPending: new FormControl('', Validators.required),
    });

    // Load agents once
    this.common.getAllAgents().subscribe({
      next: (res: any) => {
        this.allAgents = res.list || res.data || [];
      },
    });

    // Watch AgentId
    this.referralForm.controls['referredAgentId'].valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((agentIdNo: string) => {
        if (agentIdNo) {
          this.findFromAgents(agentIdNo);
        }
      });
  }

  findFromAgents(agentIdNo: string) {
    const id = agentIdNo.trim().toLowerCase();

    const agent = this.allAgents.find(
      (a: any) => a.agentIdNo?.toLowerCase() === id
    );

    console.log('', agent)

    if (agent) {
      this.referralForm.patchValue({
        referredName: agent.agentName,
        referredBirth: this.toISODate(agent.agentBirth),
        referredPhone: agent.agentPhone,
        referredEmail: agent.agentEmail,
        referredCurrentAddress: agent.agentCurrentAddress,
        referredPermanentAddress: agent.agentPermanentAddress,
      });
    } else {
      this.referralForm.patchValue({
        referredName: '',
        referredBirth: '',
        referredPhone: '',
        referredEmail: '',
        referredCurrentAddress: '',
        referredPermanentAddress: '',
      });
    }
  }

  toISODate(dateStr: string): string {
    if (!dateStr) return '';
    const [dd, mm, yyyy] = dateStr.split('/');
    return `${yyyy}-${mm}-${dd}`;
  }

  onSubmit() {
    if (this.referralForm.invalid) {
      this.submitted = true;
      return;
    }

    this.common.createReferralAgent(this.referralForm.value).subscribe({
      next: () => {
        toast.success('ReferralAgent Successfully', { class: 'toast-success' });
        this.referralForm.reset();
        this.submitted = false;
      },
      error: (error) => console.error(error),
    });
  }
}
