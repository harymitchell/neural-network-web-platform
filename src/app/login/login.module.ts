import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LoginComponent } from './login.component';
import { routes } from './login.router';
import { SharedModule } from '../shared/shared.module';

import { Angular2SocialLoginModule } from "angular2-social-login";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [
    LoginComponent
  ],
  bootstrap: [
    LoginComponent
  ]
})
export class LoginModule {}

let providers = {
    "google": {
      "clientId": "461245309734-6l2i209u2gkdk0k0u3mbm854lc3m84id.apps.googleusercontent.com"
    },
    // "linkedin": {
    //   "clientId": "LINKEDIN_CLIENT_ID"
    // },
    // "facebook": {
    //   "clientId": "FACEBOOK_CLIENT_ID",
    //   "apiVersion": "v2.4"
    // }
  };

Angular2SocialLoginModule.loadProvidersScripts(providers);