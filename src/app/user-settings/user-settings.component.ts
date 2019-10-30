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
  constructor(
    public translate: TranslateService,
    private uiService: UIService,
    public authService: AuthenticationService,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher
  ) {

  }

  ngOnInit() {
  }

}
