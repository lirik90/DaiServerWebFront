import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import {
  Router, Event as RouterEvent,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from "@angular/router";

import { MediaMatcher } from '@angular/cdk/layout';

import { AuthenticationService } from "./authentication.service";
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  loading: boolean = true;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(
    public translate: TranslateService,
    public authService: AuthenticationService,
    private router: Router,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher
  ) {
    this.router.events.subscribe((event: RouterEvent) => this.navigationInterceptor(event));

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
      
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('ru');
  }

  ngOnInit() {
    this.firstInitialization();
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.loading = true;
    }
    if (event instanceof NavigationEnd) {
      this.loading = false;
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.loading = false;
    }
    if (event instanceof NavigationError) {
      this.loading = false;
    }
  }

  firstInitialization(): void {
    this.authService.refreshToken();
  }
}
