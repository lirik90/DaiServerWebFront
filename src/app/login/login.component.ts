import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { MessageService } from '../message.service';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  model: any = {};
  loading = false;
  returnUrl: string;

  badPassword = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    // reset login status
    this.authenticationService.logout();

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  login(): void {
    this.loading = true;
    this.authenticationService.login(this.model.username, this.model.password)
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
          const nfe = error.error && error.error.non_field_errors; // TODO: Optional chaining once the proposal is adopted by TypeScript

          this.badPassword = nfe.some(x => x === 'Unable to log in with provided credentials.');

          this.messageService.add('Error: ' + error);
          this.loading = false;
        }
      );

  }
}
