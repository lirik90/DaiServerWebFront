import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import {TranslateService} from '@ngx-translate/core';
import {UIService} from '../ui.service';
import {AuthenticationService} from '../authentication.service';

interface NavLink {
  link: string;
  text: string;
  icon: string;
}

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  fillerNav: NavLink[] = []; // TODO: rename

  constructor(
    public translate: TranslateService,
    private uiService: UIService,
    public authService: AuthenticationService,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher
  ) {
    // TODO: move to the UI service, so you won't do this in every file
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    // TODO: Consider loading menu from a JSON file
    // TODO: Replace translate.instant with something else cause page is loaded before we got the translation
    this.fillerNav.push({link: 'notifications', text: this.translate.instant('USER.NOTIFICATIONS.TITLE'), icon: 'perm_device_information'});
  }

}
