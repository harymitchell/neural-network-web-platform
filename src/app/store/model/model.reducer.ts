import { MODEL_GET_SUCCESS, MODEL_REMOVE_SUCCESS, MODEL_ADD_SUCCESS, 
  MODEL_ADD_LAYER_SUCCESS, MODEL_UPDATE_SUCCESS, Actions } from './model.actions';

import { IProfile } from '../profile/profile.reducer';
import { IDataset } from '../dataset/dataset.reducer';
import { IEvaluation } from '../evaluation/evaluation.reducer';

export class IModel {
  _id: string;
  name: String;
  user: IProfile;
  dataset: IDataset;
  modelType: String;
  trainTestSplit: Number;
  inputColumns: [Number];
  outputColumns: [Number];
  optimizer: String;
  loss: String;
  metrics: String;
  sample_weight_mode: String;
  weighted_metrics: String;
  layers: [IModelLayer];
  epochs: Number;
  batch_size: Number;
  cross_validation: {
      validator: String, // NONE, StratifiedKFold, KFold
      n_splits: Number,
      shuffle: Boolean,
  };
  estimators: [
    {
        name: String
    }
  ];
  one_hot_encode_output: Boolean;
  evaluations: [IEvaluation];
  updatedAt: Date;
  isHistorical: Boolean;
  deployRequested: Boolean;
  deployID: String;
}

export class IModelLayer {
  _id: string;
  layerType: String; // eg Activation or Dense
  arguments: {}; // varies per type, dynamic
}

export function modelReducer(state: IModel[] = [], action: Actions): IModel[] {

  switch (action.type) {

    case MODEL_GET_SUCCESS:

      return action.payload;

    case MODEL_ADD_SUCCESS:
      console.log ("MODEL_ADD_SUCCESS");
      return [...state, Object.assign({}, action.payload, {
        layers: []
      })];

    case MODEL_REMOVE_SUCCESS:
      console.log ("MODEL_REMOVE_SUCCESS");
      return state.filter((model: IModel) => action.payload._id !== model._id);

    case MODEL_UPDATE_SUCCESS:
      console.log ("MODEL_UPDATE_SUCCESS");
      return state.map((model: IModel) => {
        if (action.payload._id === model._id){
          return action.payload;
        } else {
          return model;
        }
      });

    case MODEL_ADD_LAYER_SUCCESS:

      const [ model ] = state.filter((item: IModel) => action.payload._id === item._id);
      const index = state.indexOf(model);

      const newModel = Object.assign({}, model, {
        // layers: [...model.layers, action.payload.layer]
      });

      return [...state.slice(0, index), newModel, ...state.slice(index + 1)];

    default:
      return state;
  }
}
