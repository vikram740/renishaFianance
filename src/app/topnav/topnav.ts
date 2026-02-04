import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../materialModule/material.module';
import { MatIcon } from '@angular/material/icon';
import { MatChipAvatar } from '@angular/material/chips';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive} from '@angular/router';
import { Auth } from '../service/auth';
import { CommonModule } from '@angular/common';

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
    this.userName = this.authService.getName();
    this.userRole = this.authService.getRole();
  }
  get isAdminRole() {
    this.role = this.authService.getRole();
    return this.role === 'agent' || this.role === 'admin';
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
      localStorage.removeItem('memberEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('agentId');
      localStorage.removeItem('Id');
      localStorage.removeItem('agentMongoId');
      this.route.navigate(['/login']);
    }
  }
}
