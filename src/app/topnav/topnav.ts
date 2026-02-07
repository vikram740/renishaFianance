import { ChangeDetectorRef, Component, inject, PLATFORM_ID } from '@angular/core';
import { MaterialModule } from '../../materialModule/material.module';
import { MatIcon } from '@angular/material/icon';
import { MatChipAvatar } from '@angular/material/chips';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive} from '@angular/router';
import { Auth } from '../service/auth';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Common } from '../service/common';
import { environment, renishaFinance } from '../../environments/environment.development';

@Component({
  selector: 'app-topnav',
  imports: [CommonModule, RouterLinkActive, RouterLink],
  templateUrl: './topnav.html',
  styleUrl: './topnav.scss',
})
export class Topnav {
  route = inject(Router)
  authService = inject(Auth);
  userName: any;
  userRole: any;
  role: any;
  common = inject(Common);
  cdr=inject(ChangeDetectorRef)
   profilePhoto: string | null = null;
     private platformId = inject(PLATFORM_ID);


  menuAdminItems = [
    { name: 'Dashboard', link: '/dashboard' },
    { name: 'Collection', link: '/collection' },
    { name: 'Registration', link: '/registration' },
    { name: 'Member Login', link: '/memberLogin' },
    { name: 'Members', link: '/members' },
    { name: 'Notifications', link: '/notification' },
    { name: 'Requests', link: '/request' },
    { name: 'Approvals', link: '/approvals' },
    { name: 'Documents', link: '/documents' },
    { name: 'Payments', link: '/payments' },
    { name: 'Customer management', link: '/customer-management' },
   { name: 'Collection Agent management', link: '/collectionAgent' },
    { name: 'Referral Agent management', link: '/referralAgent' },
    { name: 'profile', link: '/profile' },
  ];
  menuMemberItems = [
    { name: 'Member Login', link: '/memberDashboard' },
    { name: 'profile', link: '/profile' },
  ];

  ngOnInit() {
    // fetching user name and user role from the service file
    
    console.log('this.userName', this.userName)
    this.userRole = this.authService.getRole();

    if (isPlatformBrowser(this.platformId)) {
      if (this.userRole === 'agent') {
        this.loadAgentProfile();
        this.userName = localStorage.getItem("agentName")
      } else {
        this.loadMemberProfile();
        this.userName = localStorage.getItem("memberName");
      }
    }
  }
  get isAdminRole() {
    this.role = this.authService.getRole();
    return this.role === 'agent' || this.role === 'admin';
  }

    loadMemberProfile() {
    const memberEmail = localStorage.getItem('memberEmail');
    if (!memberEmail) return;

    this.common.getAllMember().subscribe((res: any) => {
      const member = res.list?.find(
        (m: any) => m.memberEmail === memberEmail
      );

      if (member?.memberPhoto) {
        this.profilePhoto =
          environment.uploadUrl +
          renishaFinance.uploads +
          '/' +
          member.memberPhoto;
      }
      this.cdr.detectChanges()
    });
  }

    loadAgentProfile() {
    const agentEmail = localStorage.getItem('agentEmail');
    if (!agentEmail) return;

    this.common.getAllAgents().subscribe((res: any) => {
      const agent = res.list?.find(
        (a: any) => a.agentEmail === agentEmail
      );

      if (agent?.agentPhoto) {
        this.profilePhoto =
          environment.uploadUrl +
          renishaFinance.uploads +
          '/' +
          agent.agentPhoto;
      }
       this.cdr.detectChanges()
    });
  }
  closeMobileMenu(navbar: HTMLElement) {
    navbar.classList.remove('show');
  }
   logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('adminPassword');
      localStorage.removeItem('agentEmail');
        localStorage.removeItem('agentName');
      localStorage.removeItem('memberEmail');
        localStorage.removeItem('memberName');
      localStorage.removeItem('userName');
      localStorage.removeItem('agentId');
      localStorage.removeItem('Id');
      localStorage.removeItem('agentMongoId');
      this.route.navigate(['/login']);
    }
  }
}
