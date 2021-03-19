import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

import { MessageService } from '../message.service';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  model: any = {};
  loading = true;
  returnUrl: string;

  badPassword = false;
  enableCaptcha = false;
    captcha: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
      private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    // reset login status
    this.authenticationService.logout();

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

      this.checkCaptchaNeeded();
  }

    checkCaptchaNeeded() {
        this.authenticationService.needCaptchaOnLogin()
            .subscribe(needCaptcha => {
                this.enableCaptcha = needCaptcha;

                if (needCaptcha) {
                    this.authenticationService.getCaptcha()
                        .subscribe(img => {
                            let objectURL = URL.createObjectURL(img);
                            this.captcha = this.sanitizer.bypassSecurityTrustUrl(objectURL);
                            this.loading = false;
                        }, () => {
                            this.enableCaptcha = false;
                            this.loading = false;
                        });
                }
                else {
                    this.loading = false;
                }
            });
    }

  login(): void {
    this.loading = true;
    this.authenticationService.login(this.model.username, this.model.password, this.model.captcha)
      .subscribe(
        data => {
          console.log(this.returnUrl);

          /*this.router.navigateByUrl(this.returnUrl);*/
          if (this.returnUrl) {
            window.location.href = this.returnUrl;
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error => {
          this.badPassword = true;

          this.messageService.add('Error: ' + error);

          this.checkCaptchaNeeded();
        }
      );

  }
}
