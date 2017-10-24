import { Actions, USER_GET_SUCCESS, USER_CREATE_SUCCESS, USER_LOGOUT_SUCCESS } from './profile.actions';

export interface IProfile {
  name: string;
  username: string;
  email: string;
}

export function profileReducer(state: IProfile, action: Actions): IProfile {

  switch (action.type) {

    case USER_GET_SUCCESS:

      return Object.assign({}, action.payload);

    case USER_CREATE_SUCCESS:

      console.log ("USER_CREATE_SUCCESS", action.payload);
      return Object.assign({}, action.payload);

    case USER_LOGOUT_SUCCESS:

      console.log ("USER_LOGOUT_SUCCESS", action.payload);
      return null;

    default:
      return state;
  }
}
