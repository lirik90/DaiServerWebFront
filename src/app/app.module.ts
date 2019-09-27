//import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { MaterialModule } from './material.module';

import { HousesDetailModule } from './houses/houses-detail.module';
import { AppComponent } from './app.component';

import { DashboardComponent } from './houses/dashboard/dashboard.component';
import { HouseListComponent } from './houses/list/list.component';
import { HouseSearchComponent } from './houses/search/search.component';
import { HousesService } from './houses/houses.service';
import { WebSocketBytesService } from "./web-socket.service";
import { MessagesComponent } from './messages/messages.component';
import { MessageService } from './message.service';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './auth.guard';
import { AuthenticationService } from './authentication.service';
import { JwtInterceptor } from './jwt.interceptor';
import {TranslateModule, TranslateLoader, TranslateService} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {UIService} from './ui.service';
import {UserSettingsComponent} from './user-settings/user-settings.component';
import {UserSettingsModule} from './user-settings/user-settings.module';
import { CookieService } from 'ngx-cookie-service';
import {FavService} from './fav.service';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HouseListComponent,
    MessagesComponent,
    HouseSearchComponent,
    LoginComponent,
    RegisterComponent,
  ],
  imports: [
    BrowserAnimationsModule,
//    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HousesDetailModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'csrftoken',
      headerName: 'X-CSRFToken',
    },),
    TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
    MaterialModule,
    UserSettingsModule,
  ],
  providers: [
    AuthGuard,
    HousesService,
    MessageService,
    AuthenticationService,
    UIService,
    TranslateService,
    WebSocketBytesService,
    CookieService,
    FavService,
    {
    	provide: HTTP_INTERCEPTORS,
    	useClass: JwtInterceptor,
    	multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
