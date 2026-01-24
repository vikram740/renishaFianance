import { inject, Injectable } from '@angular/core';
import { environment, renishaFinance } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  http = inject(HttpClient);
  realEmail: any;
  realPassword: any;

  // isLoggedIn() {
  //   return this.getToken() !== null;
  // }

  // setting token in the localStorage
  setToken(token: string) {
    if (typeof localStorage !== 'undefined') {
      return localStorage.setItem('token', token);
    }
    else {
      return null;
    }
  }

  // fetching the token from the localStorage
  getToken() {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('token');
    }
    else {
      return null;
    }
  }

  // setting user role in the localStorage
  setRole(role: string) {
    if (typeof localStorage !== 'undefined') {
      return localStorage.setItem('role', role);
    }
    else {
      return null;
    }
  }

  // fetching the user role from the localStorage
  getRole(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('role');
    }
    else {
      return null;
    }
  }

  // setting user name in the localStorage
  setName(userName: string) {
    if (typeof localStorage !== 'undefined') {
      return localStorage.setItem('userName', userName)
    }
    else {
      return null
    }
  }

  // fetching the user name from the localStorage
  getName(): string | null {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem('userName')
    }
    else {
      return null
    }
  }

  setCredentials(data: any) {
    const email = this.b64EncodeUnicode(data.email.toLowerCase()) + '$' + this.encrptCredentials(40);
    const password = this.b64EncodeUnicode(data.password.toLowerCase()) + '$' + this.encrptCredentials(40);

    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
    localStorage.setItem('rememberMe', JSON.stringify(data.rememberMe));
  }



  getCredentials() {
    if (typeof localStorage === "undefined") return null;

    const encryptEmail = localStorage.getItem('email');
    const encryptPassword = localStorage.getItem('password');

    if (!encryptEmail || !encryptPassword) return null;

    const emailPart = encryptEmail.split('$')[0];
    const passwordPart = encryptPassword.split('$')[0];

    return {
      email: this.b64DecodeUnicode(emailPart),
      password: this.b64DecodeUnicode(passwordPart),
    };
  }

  clearCredentials() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('email');
      localStorage.removeItem('password');
      localStorage.removeItem('rememberMe');
    }
  }

  // encrypting credentials
  rand = () => Math.random().toString(36).substr(2);
  encrptCredentials = (length: any) =>
    (
      this.rand() +
      this.rand() +
      this.rand() +
      this.rand() +
      this.rand() +
      this.rand()
    ).substr(0, length);

  b64EncodeUnicode(str: any) {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  }


  b64DecodeUnicode(str: string) {
    return decodeURIComponent(
      atob(str)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }


  login(body: any) {
    return this.http.post(environment.baseUrl + renishaFinance.login, body)
  }

  signup(body: any) {
    return this.http.post(environment.baseUrl + renishaFinance.signup, body)
  }
}
