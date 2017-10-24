import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { Angular2SocialLoginModule } from "angular2-social-login";
import { AuthGuard } from './guards/auth.guard';

import { AppComponent } from './app.component';
import { routes } from './app.router';
import { metaReducers, reducers } from './store';
import { SharedModule } from './shared/shared.module';
import { WeatherService } from './weather/weather.service';
import { WeatherEffects } from './store/weather/weather.effects';
import { ProfileEffects } from './store/profile/profile.effects';
import { DatasetEffects } from './store/dataset/dataset.effects';
import { ModelEffects } from './store/model/model.effects';
import { EvaluationEffects } from './store/evaluation/evaluation.effects';
import { SelectedModelEffects } from './store/selectedModel/selectedModel.effects';
import { environment } from '../environments/environment';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import {MatCardModule, MatTableModule, MatButtonModule, MatProgressSpinnerModule,
  MatSidenavModule, MatDialogModule, MatTabsModule, MatIconModule, MatMenuModule,
  MatExpansionModule} from '@angular/material';
  
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
  
import { Ng2GoogleChartsModule } from 'ng2-google-charts';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    Ng2GoogleChartsModule,

    // Material
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatDialogModule,
    MatTabsModule,
    MatIconModule,
    MatMenuModule,
    MatExpansionModule,

    BrowserAnimationsModule,

    CommonModule,
    BrowserModule,
    Angular2SocialLoginModule,
    SharedModule,
    FormsModule,
    HttpModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([
      ProfileEffects,
      WeatherEffects,
      DatasetEffects,
      ModelEffects,
      SelectedModelEffects,
      EvaluationEffects
    ]),
    !environment.production ? StoreDevtoolsModule.instrument({ maxAge: 50 }) : [],
    RouterModule.forRoot(
      routes,
      {
        useHash: true
      }
    ),
  ],
  providers: [
    WeatherService,
    AuthGuard
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}