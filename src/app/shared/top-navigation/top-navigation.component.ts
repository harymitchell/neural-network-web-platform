import { Component, Input, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { USER_GET, USER_CREATE, USER_LOGOUT, USER_CREATE_SUCCESS, USER_LOGOUT_SUCCESS } from '../../store/profile/profile.actions';
import { ProfileEffects } from '../../store/profile/profile.effects';

import { Store } from '@ngrx/store';
import { IAppState } from '../../store/index';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

@Component({
  // changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ui-top-navigation',
  templateUrl: './top-navigation.component.html',
  styleUrls: ['./top-navigation.component.css']
})
export class TopNavigationComponent implements OnInit {
  currentUser: Object;

  @ViewChild('topnav') topnav: ElementRef;

  constructor(private profileEffects: ProfileEffects) {

    this.profileEffects.userCreate$
      .filter(action => action.type === USER_CREATE_SUCCESS)
      .subscribe(res => {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      });

    this.profileEffects.userLogout$
      .filter(action => action.type === USER_LOGOUT_SUCCESS)
      .subscribe(res => {
        this.currentUser = null;
      });
  }

  ngOnInit () {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  toggle() {
    this.topnav.nativeElement.classList.toggle(['responsive']);
  }

}
