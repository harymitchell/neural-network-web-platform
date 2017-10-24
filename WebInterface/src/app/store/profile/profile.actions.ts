import { Action } from '@ngrx/store';
import { IProfile } from './profile.reducer';

export const USER_GET = '[Profile] get user';
export const USER_GET_SUCCESS = '[Profile] get user success';
export const USER_GET_FAIL = '[Profile] get user fail';
export const USER_CREATE = '[Profile] create user';
export const USER_CREATE_SUCCESS = '[Profile] create user success';
export const USER_CREATE_FAIL = '[Profile] create user fail';
export const USER_LOGOUT = '[Profile] logged out user';
export const USER_LOGOUT_SUCCESS = '[Profile] logged out user success';

export class UserCreate implements Action {
  readonly type = USER_CREATE;

  constructor(public payload: string) {}
}

export class UserCreateSuccess implements Action {
  readonly type = USER_CREATE_SUCCESS;

  constructor(public payload: IProfile) {}
}

export class UserCreateFail implements Action {
  readonly type = USER_CREATE_FAIL;

  constructor(public payload: string) {}
}

export class UserGet implements Action {
  readonly type = USER_GET;

  constructor(public payload: string) {}
}

export class UserGetSuccess implements Action {
  readonly type = USER_GET_SUCCESS;

  constructor(public payload: IProfile) {}
}

export class UserGetFail implements Action {
  readonly type = USER_GET_FAIL;

  constructor(public payload: string) {}
}

export class UserLogout implements Action {
  readonly type = USER_LOGOUT;

  constructor(public payload: string) {}
}

export class UserLogoutSuccess implements Action {
  readonly type = USER_LOGOUT_SUCCESS;

  constructor(public payload: IProfile) {}
}

export type Actions =
  | UserGet
  | UserGetSuccess
  | UserGetFail
  | UserCreate
  | UserCreateFail
  | UserCreateSuccess
  | UserLogout
  | UserLogoutSuccess;

