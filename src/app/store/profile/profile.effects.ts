import { Effect, Actions } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/share';

import { USER_GET, UserGet, UserGetFail, UserGetSuccess,
        USER_CREATE, UserCreate, UserCreateFail, UserCreateSuccess,
        USER_LOGOUT, UserLogout, UserLogoutSuccess } from './profile.actions';

@Injectable()
export class ProfileEffects {

  @Effect()
  userGet$ = this.actions$
    .ofType(USER_GET)
    .switchMap((action: UserGet) => {

      return this.http.get('/api/user', action.payload)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new UserGetFail(error)))
        .map((response) => new UserGetSuccess(response));
    }).share();

  /**
   * For now, this is the "login" method.  We can rename later.
   */
  @Effect()
  userCreate$ = this.actions$
      .ofType(USER_CREATE)
      .switchMap((action: UserCreate) => {

        return this.http.post('/api/login', action.payload)
          .map((response: Response) => response.json())
          .catch((error) => Observable.of(new UserCreateFail(error)))
          .map((response) => new UserCreateSuccess(response));
      }).share();

  /**
   * Logs out user.
   */
  @Effect()
  userLogout$ = this.actions$
      .ofType(USER_LOGOUT)
      .switchMap((action: UserLogout) => {

        return this.http.post('/api/login/logout', action.payload)
          .map((response: Response) => response.json())
          // .catch((error) => Observable.of(new UserLogoutFail(error)))
          .map((response) => new UserLogoutSuccess(response));
      }).share();

  constructor(private actions$: Actions, private http: Http) {}
}
