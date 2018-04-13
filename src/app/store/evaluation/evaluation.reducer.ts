import { EVALUATION_GET_SUCCESS, EVALUATION_ADD_SUCCESS, 
  EVALUATION_UPDATE_SUCCESS, Actions } from './evaluation.actions';

import { IProfile } from '../profile/profile.reducer';
import { IModel } from '../model/model.reducer';

export class IEvaluation {
  _id: string;
  user: IProfile;
  model: String;
  model_ref: IModel;
  status: String;
  parameters: {};
  history: {};
  metrics_names: String[];
  scores: number[];
  createdAt: Date;
  updatedAt: Date;
}


export function evaluationReducer(state: IEvaluation[] = [], action: Actions): IEvaluation[] {

  switch (action.type) {

    case EVALUATION_GET_SUCCESS:

      return action.payload;

    case EVALUATION_ADD_SUCCESS:
      console.log ("EVALUATION_ADD_SUCCESS");
      return [...state, Object.assign({}, action.payload, {
      })];
      // return state;

    case EVALUATION_UPDATE_SUCCESS:
      console.log ("EVALUATION_UPDATE_SUCCESS");
      // return state.map((evaluation: IEvaluation) => {
      //   if (action.payload._id === evaluation._id){
      //     return action.payload;
      //   } else {
      //     return evaluation;
      //   }
      // });
      return state;

    default:
      return state;
  }
}
