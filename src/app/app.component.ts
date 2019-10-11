import { ChangeDetectorRef, Component, OnInit, OnDestroy, LOCALE_ID, Inject } from '@angular/core';
import {
  Router, Event as RouterEvent, ActivatedRoute,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from "@angular/router";

import { MediaMatcher } from '@angular/cdk/layout';

import { AuthenticationService } from "./authentication.service";
import { TranslateService } from '@ngx-translate/core';

import { UIService } from "./ui.service";
import {CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  loading: boolean = true;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  scrollTop = 0;

  languages = [
    { code: 'ru', label: 'Русский', icon: 'flag-icon flag-icon-ru'},
    { code: 'en', label: 'English', icon: 'flag-icon flag-icon-gb'},
    { code: 'fr', label: 'Français', icon: 'flag-icon flag-icon-fr'},
    //{ code: 'es', label: 'Español', icon: 'flag-icon flag-icon-es'},
  ];

  current_lang_: any;
  cookieGot: boolean;

  constructor(
    public translate: TranslateService,
    public authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    public uiService: UIService,
    public cookie: CookieService,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher
  ) {
    this.cookieGot = this.cookie.get('cookie-agree') === 'true';

    this.router.events.subscribe((event: RouterEvent) => this.navigationInterceptor(event));

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    translate.addLangs(['ru', 'en', 'fr', 'es']);
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('ru');
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    //translate.use('ru');

    let lang;
    let match = document.location.pathname.match(/\/(ru|en|fr|es)\//);

    const cookieLang = cookie.get('lang');
    if (cookieLang) {
      console.log('Cookie Lang: ' + cookieLang);
      lang = cookieLang;
    } else if (match === null) {
      const browserLang = translate.getBrowserLang();
      console.log('Browser Lang:' + browserLang);
      lang = browserLang.match(/ru|en|fr|es/) ? browserLang : 'ru';
    } else {
      console.log('url lang: ' + match[1]);
      lang = match[1];
    }

    translate.use(lang);

    document.getElementsByTagName('html')[0].setAttribute('lang', lang);

    for (let item of this.languages)
    {
      if (item.code == lang)
      {
        this.current_lang_ = item;
      }
    }
  }


  change_language(): void
  {
    let match = document.location.pathname.match(/\/(ru|en|fr|es)\//);
    if (match !== null)
    {
      let current = document.location.href;
      let result = current.replace(match[0], ('\/' + this.current_lang_.code + '\/'));

      this.cookie.set('lang', this.current_lang_.code, 365, '/');

      window.open(result, '_self');
    }
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
    this.authService.getCsrf();
  }

  onScroll($event) {
    this.scrollTop = $event.target.scrollTop;
  }

  cookieAgree() {
    this.cookie.set('cookie-agree', 'true', 365, '/');
    this.cookieGot = true;
  }
}
