import { DATASET_GET_SUCCESS, DATASET_REMOVE_SUCCESS, DATASET_ADD_SUCCESS, DATASET_ADD_COMMENT_SUCCESS, Actions,
  DATASET_UPDATE_SUCCESS } from './dataset.actions';

import { IProfile } from '../profile/profile.reducer';

export interface IDataset {
  _id: string;
  name;
  text: string;
  date: string;
  keys: string[];
  data: any[];
  columnSpec: {
  };
  delimiter: String;
  hasHeaders: Boolean;
  comments?: IDatasetComment[];
}

export interface IDatasetComment {
  id: string;
  comment: string;
}

export function datasetReducer(state: IDataset[] = [], action: Actions): IDataset[] {

  switch (action.type) {

    case DATASET_GET_SUCCESS:

      return action.payload;

    case DATASET_ADD_SUCCESS:
      console.log ("DATASET_ADD_SUCCESS");
      return [...state, Object.assign({}, action.payload, {
        comments: []
      })];

    case DATASET_REMOVE_SUCCESS:
      console.log ("DATASET_REMOVE_SUCCESS");
      return state.filter((dataset: IDataset) => action.payload._id !== dataset._id);

    case DATASET_ADD_COMMENT_SUCCESS:

      const [ dataset ] = state.filter((item: IDataset) => action.payload.id === item._id);
      const index = state.indexOf(dataset);

      const newDataset = Object.assign({}, dataset, {
        comments: [...dataset.comments, action.payload.comment]
      });

      return [...state.slice(0, index), newDataset, ...state.slice(index + 1)];

    case DATASET_UPDATE_SUCCESS:
      state = JSON.parse(JSON.stringify(state)).map(d => {
        if (d._id === action.payload._id){
          return action.payload;
        } else {
          return d;
        }
      });
      return state;

    default:
      return state;
  }
}
