import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Common } from '../service/common';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-deal-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './deal-form.html',
  styleUrl: './deal-form.scss',
})
export class DealForm {
  dealForm!: FormGroup;
  planOptions: any[] = [];
  memberList: any[] = [];
  agentList: any[] = [];
  common = inject(Common);
  selectedMemberMongoId: string | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const today = new Date().toISOString().substring(0, 10);

    this.dealForm = this.fb.group({
      memberId: ['', Validators.required],
      memberName: ['', Validators.required],
      memberAadhar: ['', Validators.required],
      memberBirth: ['', Validators.required],
      memberPan: ['', Validators.required],

      tenureType: ['', Validators.required],
      tenurePlan: [''],

      fromDate: [today],
      endDate: [''],

      tenureAmount: ['', Validators.required],
      percentage: ['', Validators.required],
      tenureInstallment: [''],
      agentNameId: ['', Validators.required],
    });

    this.getMembersList();
    this.getAllAgent();

    this.dealForm.get('memberId')?.valueChanges.subscribe((id: string) => {
      if (!id) return;

      const member = this.memberList.find(
        (m: any) => m.memberIdNo?.toLowerCase() === id.toLowerCase(),
      );
      console.log('member', member);

      if (member) {
        this.selectedMemberMongoId = member._id;
        this.dealForm.patchValue({
          memberIdNo: member.memberIdNo,
          memberName: member.memberName,
          memberAadhar: member.memberAdhaar,
          memberBirth: member.memberBirth,
          memberPan: member.memberPan,
        });
      } else {
        this.dealForm.patchValue({
          memberName: '',
          memberAadhar: '',
          dob: '',
        });
      }
    });
  }

  calculatePlanAndEndDate() {
    const { tenureAmount, tenureInstallment, tenureType, fromDate } = this.dealForm.getRawValue();

    if (!tenureAmount || !tenureInstallment || !tenureType || !fromDate) {
      return;
    }

    const tenurePlan = Math.ceil(Number(tenureAmount) / Number(tenureInstallment));

    const start = new Date(fromDate);
    const end = new Date(start);

    switch (tenureType) {
      case 'daily':
        end.setDate(start.getDate() + tenurePlan);
        break;
      case 'weekly':
        end.setDate(start.getDate() + tenurePlan * 7);
        break;
      case 'monthly':
        end.setMonth(start.getMonth() + tenurePlan);
        break;
      case 'quarterly':
        end.setMonth(start.getMonth() + tenurePlan * 3);
        break;
      case 'halfyearly':
        end.setMonth(start.getMonth() + tenurePlan * 6);
        break;
      case 'yearly':
        end.setFullYear(start.getFullYear() + tenurePlan);
        break;
    }

    this.dealForm.patchValue({
      tenurePlan,
      endDate: end.toISOString().substring(0, 10),
    });
  }

  onAgentChange() {
    const selectedId = this.dealForm.value.agentId;

    const agent = this.agentList.find((a) => a.agentId === selectedId);

    if (agent) {
      this.dealForm.patchValue({
        agentName: agent.agentName,
      });
    } else {
      this.dealForm.patchValue({
        agentName: '',
      });
    }
  }

  getMembersList() {
    this.common.getAllMember().subscribe((res: any) => {
      this.memberList = res.list;
      console.log('this.memberList', this.memberList);
    });
  }
  getAllAgent() {
    this.common.getAllAgents().subscribe((res: any) => {
      this.agentList = res.list;
      console.log('this.agentList', this.agentList);
    });
  }

  onSubmit() {
    if (this.dealForm.invalid) {
      this.dealForm.markAllAsTouched();
      return;
    }

    const raw = this.dealForm.getRawValue();
    const withSystemTime = (dateStr: string) => {
      const now = new Date();
      const date = new Date(dateStr);

      date.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

      return date.toISOString();
    };

    const payload = {
      memberId: this.selectedMemberMongoId,
      memberIdNo: raw.memberIdNo,
      memberName: raw.memberName,
      memberAadhar: raw.memberAdhaar,
      memberBirth: raw.memberBirth,
      memberPan: raw.memberPan,
      tenureType: raw.tenureType,
      tenurePlan: raw.tenurePlan,
      fromDate: withSystemTime(raw.fromDate),
      endDate: withSystemTime(raw.endDate),
      agentNameId: raw.agentNameId,
      tenureAmount: raw.tenureAmount,
      percentage: raw.percentage,
      tenureInstallment: raw.tenureInstallment,
    };

    this.common.createDeal(payload).subscribe((res: any) => {
      console.log('deal ', res);
      toast.success('Registration Successfully', { class: 'toast-success' });
      this.dealForm.reset();
    });
  }
}
