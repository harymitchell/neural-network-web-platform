import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { IAppState } from '../store/index';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { USER_GET, USER_GET_SUCCESS, USER_GET_FAIL, USER_CREATE, USER_LOGOUT, USER_CREATE_SUCCESS, USER_LOGOUT_SUCCESS } from '../store/profile/profile.actions';
import { ProfileEffects } from '../store/profile/profile.effects';
import { IProfile } from '../store/profile/profile.reducer';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import { AuthService } from 'angular2-social-login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnDestroy, OnInit {
  currentUser: Object;
  subs: Subscription[];
  profile$: Observable<IProfile>;
  profileStore$:  Store<IProfile>;

  constructor(private store: Store<IAppState>, public _auth: AuthService, private router: Router, private profileEffects: ProfileEffects) { 
    // this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.profileStore$ = store.select('profile');
    this.profile$ = this.profileStore$.map((profile) => profile);

    this.subs = [];
    this.subs.push(
        store.subscribe(res => {
            console.log("LOGIN COMPONENT STORE EVENT", res);
        })
    );

    this.subs.push(
        this.profileEffects.userCreate$
            .filter(action => action.type === USER_CREATE_SUCCESS)
            .subscribe(res => {
                console.log("LOGIN userCreate effect");
                this.router.navigate(['/datasets']);
                // location.reload();
            })
    );

    // this.subs.push(
    //     this.profileEffects.userGet$
    //         .filter(action => action.type === USER_GET_SUCCESS)
    //         .subscribe(res => {
    //             console.log("User Get success login componenet");
    //             // this.router.navigate(['/datasets']);
    //             // location.reload();
    //         })
    // );

    this.subs.push(
        this.profileEffects.userLogout$
            .filter(action => action.type === USER_LOGOUT_SUCCESS)
            .subscribe(res => {
                this.router.navigate(['/login']);
            })
    );

    console.log("LoginComponent", document.location);
    if (document.location.hash === '#/logout') {
        this.logout();
    } 
    // else if (this.currentUser) {
        // this.router.navigate(['/datasets']);
        // location.reload();
    // }
  }

  signIn(provider){
    this.subs.push(
        this._auth.login(provider).subscribe( (data) => {
            console.log("signIn",data);
            this.currentUser = data;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.store.dispatch({
                type: USER_CREATE,
                payload: this.currentUser
            });
        })
    );
  }

  logout(){
    this.subs.push(
        this._auth.logout().subscribe((data) => {
            console.log("logout",data);
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            this.store.dispatch({
                type: USER_LOGOUT
            });
        })
    );
  }

  ngOnInit(){
    // this.store.dispatch({
    //   type: USER_GET
    // });
  }

  ngOnDestroy(){
    this.subs.forEach(sub => {
        sub.unsubscribe();
    });
  }

}
