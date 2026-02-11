import { Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import { MaterialModule } from '../../materialModule/material.module';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Auth } from '../service/auth';
import { Common } from '../service/common';
import { environment, renishaFinance } from '../../environments/environment.development';

@Component({
  selector: 'app-sidenav',
  imports: [MaterialModule, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
})
export class Sidenav {
  route = inject(Router);
  authService = inject(Auth);
  role: any;
  dashboard: string = '/icons/Dashboard.png';
  collection: string = '/icons/collection.png';
  memberLogin: string = '/icons/member login.png';
  registration: string = '/icons/Registration.png';
  members: string = '/icons/Members.png';
  notifications: string = '/icons/Notification.png';
  requests: string = '/icons/request.png';
  approvals: string = '/icons/Approved.png';
  documents: string = '/icons/Documents.png';
  payments: string = '/icons/Payments.png';
  customers: string = '/icons/Customer.png';
  collectionAgent: string = '/icons/CollectionAgent.png';
  refferals: string = '/icons/Refferal.png';
  settings: string = '/icons/Settings.png';
  trash: string = '/icons/Trash.png';
  logoff: string = '/icons/Logout.png';
  help: string = '/icons/Help.png';
  agentEmail: any;
  common = inject(Common);
  agentList: any;
  agentPhoto: any;
  menuAdminItems = [
    { name: 'Dashboard', icon: this.dashboard, link: '/dashboard' },
    // { name: 'Collection', icon: this.collection, link: '/collection' },
    { name: 'Registration', icon: this.registration, link: '/registration' },
    { name: 'Member Login', icon: this.memberLogin, link: '/memberLogin' },
    { name: 'Members', icon: this.members, link: '/members' },
    { name: 'Notifications', icon: this.notifications, link: '/notification' },
    { name: 'Requests', icon: this.requests, link: '/request' },
    { name: 'Approvals', icon: this.approvals, link: '/approvals' },
    { name: 'Documents', icon: this.documents, link: '/documents' },
    { name: 'Deal Form', icon: this.registration, link: '/dealForm' },
    { name: 'Deal List', icon: this.members, link: '/dealList' },
    { name: 'Payments', icon: this.payments, link: '/payments' },
    { name: 'PrimaryQrLog', icon: this.payments, link: '/primaryQrLog' },
    { name: 'PaymentsList', icon: this.payments, link: '/paymentList' },
    { name: 'User Management', icon: this.customers, link: '/userManagement' },
    { name: 'Customer management', icon: this.customers, link: '/customerManagement' },
    // { name: 'Collection Agent management', icon: this.collectionAgent, link: '/collectionAgent' },
    { name: 'Agents', icon: this.collectionAgent, link: '/agentList' },
    { name: 'Referral Agent management', icon: this.refferals, link: '/referralAgent' },
  ];

  menuAgentItems = [
    { name: 'Collection', icon: this.collection, link: '/collection' },
    { name: 'Members', icon: this.members, link: '/members' },
    { name: 'Member Login', icon: this.memberLogin, link: '/memberLogin' },
    // { name: 'Deal Form', icon: this.registration, link: '/dealForm' },
    { name: 'Deal List', icon: this.members, link: '/dealList' },
    { name: 'ManualLogin', icon: this.memberLogin, link: '/manualLogin' },
  ];

  menuMemberItems = [
    { name: 'Member Dashboard', icon: this.memberLogin, link: '/memberDashboard' },
  ];
  utlityMenu = [
    // { name: 'Settings', icon: this.settings, link: '/settings' },
    // { name: 'Trash', icon: this.trash, link: '/trash' },
    // { name: 'Help', icon: this.help, link: '/help' },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.role = this.authService.getRole();
  }

  get menuItems() {
    this.role = this.authService.getRole();

    if (this.role === 'admin') {
      return this.menuAdminItems;
    }

    if (this.role === 'agent') {
      return this.menuAgentItems;
    }

    // member
    return this.menuMemberItems;
  }



}
