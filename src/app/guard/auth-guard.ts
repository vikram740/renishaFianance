// import { isPlatformBrowser } from '@angular/common';
// import { inject, PLATFORM_ID } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { Auth } from '../service/auth';

// export const authGuard: CanActivateFn = (route, state) => {
//   const router = inject(Router); // Inject the Router service
//   const platformId = inject(PLATFORM_ID);
//   const authService = inject(Auth)

//   if (!isPlatformBrowser(platformId)) {
//     return true;   // Let SSR render the page
//   }
//   // const isAuthenticated = authService.isLoggedIn();
//   const isAuthenticated = localStorage.getItem('token')
//   // // normal guard

//   if (isAuthenticated) {
//     // If authenticated, allow access to the route
//     return true;
//   } else {
//     // If not authenticated, redirect to the login page
//     // router.navigate(['/login']); // Adjust the route as needed
//     return false;
//   }
// };



import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';


export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router); // Inject the Router service

  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;   // Let SSR render the page
  }

  const isAuthenticated = localStorage.getItem('token') !== null;


  if (isAuthenticated) {
    // If authenticated, allow access to the route
    return true;
  } else {
    // If not authenticated, redirect to the login page
    router.navigate(['/login']); // Adjust the route as needed
    return false;
  }
};


