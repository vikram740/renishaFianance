import { Component, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Common } from '../service/common';
import { CommonModule, DatePipe, isPlatformBrowser, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-collection',
  imports: [MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,DatePipe,UpperCasePipe,CommonModule],
  templateUrl: './collection.html',
  styleUrl: './collection.scss',
})
export class Collection {
  common = inject(Common);
  platformId = inject(PLATFORM_ID);

  agentEmail = '';
  agentIdNo = '';

  todayCollections: any[] = [];
  todayTotalAmount = 0;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.agentEmail = localStorage.getItem('agentEmail') || '';
    if (!this.agentEmail) return;

    this.loadAgent();
  }

  loadAgent() {
    this.common.getAllAgents().subscribe((res: any) => {
      const agents = res.list || [];

      const agent = agents.find(
        (a: any) =>
          a.agentEmail?.toLowerCase() === this.agentEmail.toLowerCase()
      );

      if (!agent) return;

      this.agentIdNo = agent.agentIdNo;
      console.log('this.agentIdNo', this.agentIdNo)
      this.loadTodayCollections();
    });
  }

  loadTodayCollections() {
   const today = new Date().toISOString().split('T')[0];

  this.common.getDealCollections().subscribe((res: any) => {
    const collections = res.list || [];
    console.log('collections', collections)

    const todayAgentCollections = collections.filter((item: any) => {
      const createdDate = item.createdAt?.split('T')[0];
       return (
        createdDate === today &&
        item.transactionId?.includes(this.agentIdNo)
      );
    });

    this.todayCollections = todayAgentCollections;

    console.log('Today agent collection count:', this.todayCollections);
  });
  }
}