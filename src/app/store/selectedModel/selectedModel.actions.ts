// import { ISelectedModel, ISelectedModelLayer } from './selectedModel.reducer';
import { IModel, IModelLayer } from '../model/model.reducer';
import { IDataset } from '../dataset/dataset.reducer';

import { Action } from '@ngrx/store';

export const SELECTED_MODEL_GET = '[SelectedModel] get';
export const SELECTED_MODEL_GET_FAIL = '[SelectedModel] get fail';
export const SELECTED_MODEL_GET_SUCCESS = '[SelectedModel] get success';

export const SELECTED_MODEL_SET = '[SelectedModel] set new';
export const SELECTED_MODEL_SET_FAIL = '[SelectedModel] set new fail';
export const SELECTED_MODEL_SET_SUCCESS = '[SelectedModel] set new success';

export const SELECTED_MODEL_UPDATE_LAYER = '[SelectedModel] update new layer';
export const SELECTED_MODEL_UPDATE_LAYER_SUCCESS = '[SelectedModel] update new layer success';
export const SELECTED_MODEL_ADD_LAYER = '[SelectedModel] set new layer';
export const SELECTED_MODEL_ADD_LAYER_FAIL = '[SelectedModel] set new layer fail';
export const SELECTED_MODEL_ADD_LAYER_SUCCESS = '[SelectedModel] set new layer success';

export const SELECTED_MODEL_REMOVE_LAYER = '[SelectedModel] remove layer';
export const SELECTED_MODEL_REMOVE_LAYER_SUCCESS = '[SelectedModel] remove layer success';

export const SELECTED_MODEL_REMOVE = '[SelectedModel] remove';
export const SELECTED_MODEL_REMOVE_FAIL = '[SelectedModel] remove fail';
export const SELECTED_MODEL_REMOVE_SUCCESS = '[SelectedModel] remove success';

export const SELECTED_MODEL_UPDATE = '[SelectedModel] update';
export const SELECTED_MODEL_UPDATE_FAIL = '[SelectedModel] update fail';
export const SELECTED_MODEL_UPDATE_SUCCESS = '[SelectedModel] update success';

/* SelectedModel Get */
export class SelectedModelGet implements Action {
  readonly type = SELECTED_MODEL_GET;

  constructor(public payload: string) {}
}

export class SelectedModelGetSuccess implements Action {
  readonly type = SELECTED_MODEL_GET_SUCCESS;

  constructor(public payload: IModel) {}
}

export class SelectedModelGetFail implements Action {
  readonly type = SELECTED_MODEL_GET_FAIL;

  constructor(public payload: string) {}
}

/* SelectedModel Set */
export class SelectedModelSet  implements Action { 
  readonly type = SELECTED_MODEL_SET;

  constructor(public payload: IModel) {}
}

export class SelectedModelSetSuccess implements Action {
  readonly type = SELECTED_MODEL_SET_SUCCESS;

  constructor(public payload: IModel) {}
}

export class SelectedModelSetFail implements Action {
  readonly type = SELECTED_MODEL_SET_FAIL;

  constructor(public payload: string) {}
}

/* SelectedModel Set Layer */
export class SelectedModelUpdateLayer implements Action {
  readonly type = SELECTED_MODEL_UPDATE_LAYER;

  constructor(public payload: {i: Number, layer: IModelLayer}) {}
}

export class SelectedModelUpdateLayerSuccess implements Action {
  readonly type = SELECTED_MODEL_UPDATE_LAYER_SUCCESS;

  constructor(public payload: IModelLayer) {}
}

export class SelectedModelAddLayer implements Action {
  readonly type = SELECTED_MODEL_ADD_LAYER;

  constructor(public payload: {newLayer: IModelLayer, model: IModel}) {}
}

export class SelectedModelAddLayerSuccess implements Action {
  readonly type = SELECTED_MODEL_ADD_LAYER_SUCCESS;

  constructor(public payload: {newLayer: IModelLayer, model: IModel}) {}
}

export class SelectedModelAddLayerFail implements Action {
  readonly type = SELECTED_MODEL_ADD_LAYER_FAIL;

  constructor(public payload: string) {}
}

export class SelectedModelRemoveLayer implements Action {
  readonly type = SELECTED_MODEL_REMOVE_LAYER;

  constructor(public payload: IModelLayer) {}
}

export class SelectedModelRemoveLayerSuccess implements Action {
  readonly type = SELECTED_MODEL_REMOVE_LAYER_SUCCESS;

  constructor(public payload: IModelLayer) {}
}

/* SelectedModel Remove */
export class SelectedModelRemove implements Action {
  readonly type = SELECTED_MODEL_REMOVE;

  constructor(public payload: string) {}
}

export class SelectedModelRemoveSuccess implements Action {
  readonly type = SELECTED_MODEL_REMOVE_SUCCESS;

  constructor(public payload: IModel) {}
}

export class SelectedModelRemoveFail implements Action {
  readonly type = SELECTED_MODEL_REMOVE_FAIL;

  constructor(public payload: string) {}
}

/* SelectedModel Update */
export class SelectedModelUpdate implements Action {
  readonly type = SELECTED_MODEL_UPDATE;
  _id: Number;
  dataset: IDataset;
  sliderCurrentIndex: Number;

  constructor(public payload: IModel) {}
}

export class SelectedModelUpdateSuccess implements Action {
  readonly type = SELECTED_MODEL_UPDATE_SUCCESS;

  constructor(public payload: IModel) {}
}

export class SelectedModelUpdateFail implements Action {
  readonly type = SELECTED_MODEL_UPDATE_FAIL;

  constructor(public payload: string) {}
}

export type Actions =
  | SelectedModelGet
  | SelectedModelGetSuccess
  | SelectedModelGetFail
  | SelectedModelSet
  | SelectedModelSetSuccess
  | SelectedModelSetFail
  | SelectedModelUpdateLayer
  | SelectedModelUpdateLayerSuccess
  | SelectedModelAddLayer
  | SelectedModelAddLayerSuccess
  | SelectedModelAddLayerFail
  | SelectedModelRemoveLayer
  | SelectedModelRemoveLayerSuccess
  | SelectedModelRemove
  | SelectedModelRemoveSuccess
  | SelectedModelRemoveFail
  | SelectedModelUpdateFail
  | SelectedModelUpdateSuccess
  | SelectedModelUpdate;
