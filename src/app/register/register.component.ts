import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from '../message.service';
import { AuthenticationService } from "../authentication.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  model: any = {};
  loading = false;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
  }

  register(): void {
    this.loading = true;
    this.authService.createUser(this.model)
	  .subscribe(
		data => {
                    // set success message and pass true paramater to persist the message after redirecting to the login page
                    this.messageService.add('Registration successful');
                    this.router.navigate(['/login']);
                },
                error => {
                    this.messageService.add(error);
                    this.loading = false;
                });
  }
}
