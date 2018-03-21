import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { USER_GET, USER_GET_SUCCESS, USER_CREATE, USER_LOGOUT, USER_CREATE_SUCCESS, USER_LOGOUT_SUCCESS } from '../../store/profile/profile.actions';
import { ProfileEffects } from '../../store/profile/profile.effects';

import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { IAppState } from '../../store/index';
import { Observable } from 'rxjs/Observable';
import { IProfile } from '../../store/profile/profile.reducer';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

@Component({
  // changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ui-top-navigation',
  templateUrl: './top-navigation.component.html',
  styleUrls: ['./top-navigation.component.css']
})
export class TopNavigationComponent implements OnInit, OnDestroy {
  currentUser: Object;
  subs: Subscription[];
  profile$: Observable<IProfile>;
  profileStore$:  Store<IProfile>;

  @ViewChild('topnav') topnav: ElementRef;

  constructor(private store: Store<IAppState>, private profileEffects: ProfileEffects) {
    this.profileStore$ = store.select('profile');
    this.profile$ = this.profileStore$.map((profile) => profile);

    this.subs = [];
    // this.subs.push(
    //   this.profileEffects.userCreate$
    //     .filter(action => action.type === USER_CREATE_SUCCESS)
    //     .subscribe(res => {
    //       this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //     })
    // );

    // this.subs.push(
    //   this.profileEffects.userLogout$
    //     .filter(action => action.type === USER_LOGOUT_SUCCESS)
    //     .subscribe(res => {
    //       this.currentUser = null;
    //     })
    //  );

    // this.subs.push(
    //   this.profileEffects.userGet$
    //       .filter(action => action.type === USER_GET_SUCCESS)
    //       .subscribe(res => {
    //           console.log("User Get success top nav");
    //           // this.router.navigate(['/datasets']);
    //           // location.reload();
    //       })
    // );
  }

  ngOnInit () {
    this.store.dispatch({
      type: USER_GET
    });
  }

  ngOnDestroy() {
    this.subs.forEach(sub => {
        sub.unsubscribe();
    });
  }

  toggle() {
    this.topnav.nativeElement.classList.toggle(['responsive']);
  }

}
