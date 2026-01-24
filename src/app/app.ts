import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { Sidenav } from './sidenav/sidenav';
import { Topnav } from './topnav/topnav';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster, Sidenav, Topnav,CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('renishaFinance');
  private router = inject(Router);

  currentUrl = signal('');
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });
  }
}
