import { ChangeDetectorRef, Component, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Common } from '../service/common';
import { CommonModule, DatePipe, isPlatformBrowser, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-collection',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './collection.html',
  styleUrl: './collection.scss',
})
export class Collection {
  common = inject(Common);
  platformId = inject(PLATFORM_ID);

  agentEmail = '';
  agentIdNo = '';
  cdr = inject(ChangeDetectorRef);

  todayCollections: any[] = [];
  todayTotalAmount = 0;
  agentId: any;
  fromdate:any;
  toDate:any

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.agentEmail = localStorage.getItem('agentEmail') || '';
    if (!this.agentEmail) return;

    this.common.getAllAgents().subscribe((response: any) => {
      const agents = response.list || [];

      const agent = agents.find(
        (a: any) => a.agentEmail?.toLowerCase() === this.agentEmail.toLowerCase(),
      );

      if (!agent?._id) {
        console.error('Agent Mongo ID not found');
        return;
      }

      // ✅ Store + set immediately
      this.agentId = agent._id;
      this.agentIdNo = agent.agentIdNo
      console.log('this.agentIdNo', this.agentIdNo)
      localStorage.setItem('agentMongoId', agent._id);

      this.fromdate = Date.now();
      this.toDate = Date.now();

      if(this.fromdate &&this.toDate&&this.agentIdNo){
         this.loadPaidDashboard(this.fromdate,this.toDate,this.agentIdNo)

      }


     


    });
  }

  // loadAgent() {
  //   this.common.getSingleAgent(this.agentId).subscribe((res: any) => {
  //     const agents = res.user || [];
  //     console.log('agents', agents);

  //     this.agentIdNo = agents._id;
  //     console.log('this.agentIdNo', this.agentIdNo);
  //     this.loadTodayCollections();
  //   });
  // }

  // loadTodayCollections() {
  //   const now = new Date();
  //   const todayLocal =
  //     now.getFullYear() +
  //     '-' +
  //     String(now.getMonth() + 1).padStart(2, '0') +
  //     '-' +
  //     String(now.getDate()).padStart(2, '0');

  //   this.common.getDealCollections().subscribe((res: any) => {
  //     const collections = res.list || [];
  //     console.log('collections', collections);

  //     const todayAgentCollections = collections.filter((item: any) => {
  //       if (!item.createdAt) return false;

  //       const d = new Date(item.createdAt);
  //       const createdLocal =
  //         d.getFullYear() +
  //         '-' +
  //         String(d.getMonth() + 1).padStart(2, '0') +
  //         '-' +
  //         String(d.getDate()).padStart(2, '0');

  //       return createdLocal === todayLocal && item.agentId === this.agentIdNo;
  //     });

  //     this.todayCollections = todayAgentCollections;

  //     // this.todayTotalAmount = this.todayCollections.reduce(
  //     //   (sum, item) => sum + Number(item.installmentPaidAmount || 0),
  //     //   0,
  //     // );

  //     // ✅ Only here it is meaningful
  //     this.cdr.detectChanges();
  //   });
  // }

    withSystemTime(date: Date): string {
    const now = new Date();
    const d = new Date(date);

    d.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

    return d.toISOString();
  }
  withEndOfDay(date: Date): string {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }

    loadPaidDashboard(fromDate: Date, toDate: Date,agentId:string) {
    const params = {
      type: 'overview',
      mode: 'custom',
      fromDate: this.withSystemTime(fromDate),
      toDate: this.withEndOfDay(toDate),
      agentId: this.agentIdNo,
    };

    this.common.dashBoard(params).subscribe((res: any) => {
      const data = res?.data?.[0] || {};
      console.log('data', data)
      this.todayTotalAmount = data.totalPaidAmount || 0;
      console.log('this.todayTotalAmount', this.todayTotalAmount)
     this.cdr.detectChanges()
    });
  }
}
