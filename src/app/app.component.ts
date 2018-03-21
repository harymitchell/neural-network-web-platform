import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Store } from '@ngrx/store';
import { IAppState } from './store/index';
import { USER_GET } from './store/profile/profile.actions';

import { Subscription } from 'rxjs/Subscription';
import { IProfile } from './store/profile/profile.reducer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit  {
  profile$: Observable<IProfile>;
  profileStore$:  Store<IProfile>;

  observable$: Observable<{}>;

  constructor(http: Http, private store: Store<IAppState>) {
    this.profileStore$ = store.select('profile');
    this.profileStore$.map((profile) => profile);
  }

  ngOnInit () {
  }
}