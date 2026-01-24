import { Routes } from '@angular/router';
import { authGuard } from './guard/auth-guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
    { path: 'signup', loadComponent: () => import('./signup/signup').then(m => m.Signup) },
    { path: 'forgetPassword', loadComponent: () => import('./forgot-password/forgot-password').then(m => m.ForgotPassword) },
    { path: 'resetPassword', loadComponent: () => import('./reset-password/reset-password').then(m => m.ResetPassword) },
    { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
    { path: 'collection', canActivate: [authGuard], loadComponent: () => import('./collection/collection').then(m => m.Collection) },
    { path: 'customerManagement', canActivate: [authGuard], loadComponent: () => import('./customer-management/customer-management').then(m => m.CustomerManagement) },
    { path: 'memberDashboard', canActivate: [authGuard], loadComponent: () => import('./member-dashboard/member-dashboard').then(m => m.MemberDashboard) },
    { path: 'memberAddCollection/:id', canActivate: [authGuard], loadComponent: () => import('./member-add-collection/member-add-collection').then(m => m.MemberAddCollection) },
    { path: 'memberLogin', canActivate: [authGuard], loadComponent: () => import('./member-login/member-login').then(m => m.MemberLogin) },
    { path: 'registration', canActivate: [authGuard], loadComponent: () => import('./registration/registration').then(m => m.Registration) },
    { path: 'referralAgent', canActivate: [authGuard], loadComponent: () => import('./referral-agent/referral-agent').then(m => m.ReferralAgent) },
    { path: 'collectionAgent', canActivate: [authGuard], loadComponent: () => import('./collection-agent/collection-agent').then(m => m.CollectionAgent) },
    { path: 'documents', canActivate: [authGuard], loadComponent: () => import('./documents/documents').then(m => m.Documents) },
    { path: 'members', canActivate: [authGuard], loadComponent: () => import('./members/members').then(m => m.Members) },
    { path: 'approvals', canActivate: [authGuard], loadComponent: () => import('./approval/approval').then(m => m.Approval) },
    { path: 'request', canActivate: [authGuard], loadComponent: () => import('./request/request').then(m => m.Request) },
    { path: 'dealForm', canActivate: [authGuard], loadComponent: () => import('./deal-form/deal-form').then(m => m.DealForm) },
    { path: 'dealList', canActivate: [], loadComponent: () => import('./deal-list/deal-list').then(m => m.DealList) },
    { path: 'payments', canActivate: [authGuard], loadComponent: () => import('./payments/payments').then(m => m.Payments) },
    { path: 'notification', canActivate: [authGuard], loadComponent: () => import('./notification/notification').then(m => m.Notification) },
    { path: '**', redirectTo: 'login' }
];

