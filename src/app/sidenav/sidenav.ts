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
  route = inject(Router)
  authService = inject(Auth)
  role: any;
  dashboard: string = '/icons/Dashboard.png';
  collection:string ='/icons/collection.png';
  memberLogin:string='/icons/member login.png';
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
  agentEmail :any;
  common = inject(Common);
  agentList :any;
  agentPhoto:any
  menuAdminItems = [
    { name: 'Dashboard', icon: this.dashboard, link: '/dashboard' },
    { name: 'Collection', icon: this.collection, link: '/collection' },
    { name: 'Registration', icon: this.registration, link: '/registration' },
    { name: 'Member Login', icon: this.memberLogin, link: '/memberLogin' },
    { name: 'Members', icon: this.members, link: '/members' },
    { name: 'Notifications', icon: this.notifications, link: '/notification' },
    { name: 'Requests', icon: this.requests, link: '/request' },
    { name: 'Approvals', icon: this.approvals, link: '/approvals' },
    { name: 'Documents', icon: this.documents, link: '/documents' },
    { name: 'Deal Form', icon: this.registration, link: '/dealForm' },
     { name: 'Deal List', icon: this.members, link: '/dealList' },
    {name: 'Payments', icon: this.payments, link: '/payments' },
    { name: 'Customer management', icon: this.customers, link: '/customerManagement' },
    { name: 'Collection Agent management', icon: this.collectionAgent, link: '/collectionAgent' },
    { name: 'Referral Agent management', icon: this.refferals, link: '/referralAgent' },
  ];
  menuMemberItems =[
      { name: 'Member Dashboard', icon: this.memberLogin, link: '/memberDashboard' },
  ]
  utlityMenu = [
    // { name: 'Settings', icon: this.settings, link: '/settings' },
    // { name: 'Trash', icon: this.trash, link: '/trash' },
    // { name: 'Help', icon: this.help, link: '/help' },
  ];

    constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    ){}


  ngOnInit() {
    this.role = this.authService.getRole();
    
        if (isPlatformBrowser(this.platformId)) {
          this.agentEmail = localStorage.getItem('agentEmail');
        }
        this.getAllAgent()
  }
  
  get isAdminRole(){
      this.role = this.authService.getRole();
      return this.role ==='agent'|| this.role ==='admin'

  }

   getAllAgent() {
    this.common.getAllAgents().subscribe((res: any) => {
      this.agentList = res.list || [];
      console.log('this.agentList', this.agentList)
      const agentEmail = this.agentEmail;
      if (!agentEmail) return;

      const selectedAgent = this.agentList.find((agent: any) => agent.agentEmail === agentEmail);
      if (selectedAgent) {
        const bsaeUrl = environment.uploadUrl + renishaFinance.uploads + '/';
        this.agentPhoto = {
          agentPhoto:selectedAgent.agentPhoto? bsaeUrl +selectedAgent.agentPhoto:null 
        }
        console.log('this.agentPhoto', this.agentPhoto)
      }
    });
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('memberEmail');
      localStorage.removeItem('userName');
      this.route.navigate(['/login']);
    }
  }

}

