// import { HttpInterceptorFn } from '@angular/common/http';

// export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
//   // Get the token from wherever you store it (e.g., localStorage, a service, etc.)
//   const token = localStorage.getItem('token');
//   // Clone the request and add the authorization header if the token exists
//   if (token) {
//     const authReq = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`
//       }
//     });
//     // Pass on the cloned request instead of the original request.
//     return next(authReq);
//   }
//   return next(req);
// };

// import { isPlatformBrowser } from '@angular/common';
// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject, PLATFORM_ID } from '@angular/core';

// export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
//   const platformId = inject(PLATFORM_ID);
//   if (!isPlatformBrowser(platformId)) {
//     return next(req);
//   }
//   const token = localStorage.getItem('token');

//   if (token) {
//     const authReq = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return next(authReq);
//   }
//   return next(req);
// };

import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Auth } from '../service/auth';
import { isPlatformBrowser } from '@angular/common';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  let  token = authService.getToken();
  const platformId = inject(PLATFORM_ID);
  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('token');
  }

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};



