import { IModel, IModelLayer } from './model.reducer';
import { Action } from '@ngrx/store';

export const MODEL_GET = '[Model] get';
export const MODEL_GET_FAIL = '[Model] get fail';
export const MODEL_GET_SUCCESS = '[Model] get success';

export const MODEL_ADD = '[Model] add new';
export const MODEL_ADD_FAIL = '[Model] add new fail';
export const MODEL_ADD_SUCCESS = '[Model] add new success';

export const MODEL_ADD_LAYER = '[Model] add new layer';
export const MODEL_ADD_LAYER_FAIL = '[Model] add new layer fail';
export const MODEL_ADD_LAYER_SUCCESS = '[Model] add new layer success';

export const MODEL_REMOVE = '[Model] remove';
export const MODEL_REMOVE_FAIL = '[Model] remove fail';
export const MODEL_REMOVE_SUCCESS = '[Model] remove success';

export const MODEL_UPDATE = '[Model] update';
export const MODEL_UPDATE_FAIL = '[Model] update fail';
export const MODEL_UPDATE_SUCCESS = '[Model] update success';

/* Model Get */
export class ModelGet implements Action {
  readonly type = MODEL_GET;

  constructor(public payload: string) {}
}

export class ModelGetSuccess implements Action {
  readonly type = MODEL_GET_SUCCESS;

  constructor(public payload: [IModel]) {}
}

export class ModelGetFail implements Action {
  readonly type = MODEL_GET_FAIL;

  constructor(public payload: string) {}
}

/* Model Add */
export class ModelAdd implements Action {
  readonly type = MODEL_ADD;

  constructor(public payload: IModel) {}
}

export class ModelAddSuccess implements Action {
  readonly type = MODEL_ADD_SUCCESS;

  constructor(public payload: IModel) {}
}

export class ModelAddFail implements Action {
  readonly type = MODEL_ADD_FAIL;

  constructor(public payload: string) {}
}

/* Model Add Layer */
export class ModelAddLayer implements Action {
  readonly type = MODEL_ADD_LAYER;

  constructor(public payload: IModelLayer) {}
}

export class ModelAddLayerSuccess implements Action {
  readonly type = MODEL_ADD_LAYER_SUCCESS;

  constructor(public payload: IModelLayer) {}
}

export class ModelAddLayerFail implements Action {
  readonly type = MODEL_ADD_LAYER_FAIL;

  constructor(public payload: string) {}
}

/* Model Remove */
export class ModelRemove implements Action {
  readonly type = MODEL_REMOVE;

  constructor(public payload: string) {}
}

export class ModelRemoveSuccess implements Action {
  readonly type = MODEL_REMOVE_SUCCESS;

  constructor(public payload: IModel) {}
}

export class ModelRemoveFail implements Action {
  readonly type = MODEL_REMOVE_FAIL;

  constructor(public payload: string) {}
}

/* Model Update */
export class ModelUpdate implements Action {
  readonly type = MODEL_UPDATE;
  _id: Number;

  constructor(public payload: IModel) {}
}

export class ModelUpdateSuccess implements Action {
  readonly type = MODEL_UPDATE_SUCCESS;

  constructor(public payload: IModel) {}
}

export class ModelUpdateFail implements Action {
  readonly type = MODEL_UPDATE_FAIL;

  constructor(public payload: string) {}
}

export type Actions =
  | ModelGet
  | ModelGetSuccess
  | ModelGetFail
  | ModelAdd
  | ModelAddSuccess
  | ModelAddFail
  | ModelAddLayer
  | ModelAddLayerSuccess
  | ModelAddLayerFail
  | ModelRemove
  | ModelRemoveSuccess
  | ModelRemoveFail
  | ModelUpdateFail
  | ModelUpdateSuccess
  | ModelUpdate;
