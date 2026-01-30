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
  cdr=inject(ChangeDetectorRef)

  todayCollections: any[] = [];
  todayTotalAmount = 0;
  agentId :any

 ngOnInit() {
  if (!isPlatformBrowser(this.platformId)) return;

  this.agentEmail = localStorage.getItem('agentEmail') || '';
  if (!this.agentEmail) return;
  this.agentId = localStorage.getItem('agentMongoId') || '';
  console.log('this.agentId', this.agentId)

  this.loadAgent();
}

loadAgent() {
  this.common.getSingleAgent(this.agentId).subscribe((res: any) => {
    const agents = res.user || [];
    console.log('agents', agents)



    this.agentIdNo = agents._id;
    this.loadTodayCollections();
  });
}

loadTodayCollections() {
  const now = new Date();
  const todayLocal =
    now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');

  this.common.getDealCollections().subscribe((res: any) => {
    const collections = res.list || [];

    const todayAgentCollections = collections.filter((item: any) => {
      if (!item.createdAt) return false;

      const d = new Date(item.createdAt);
      const createdLocal =
        d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');

      return (
        createdLocal === todayLocal &&
        item.agentId === this.agentIdNo
      );
    });

    this.todayCollections = todayAgentCollections;

    this.todayTotalAmount = this.todayCollections.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    // ✅ Only here it is meaningful
    this.cdr.detectChanges();
  });
}





}