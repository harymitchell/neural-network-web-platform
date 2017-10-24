import { IDataset, IDatasetComment } from './dataset.reducer';
import { Action } from '@ngrx/store';

export const DATASET_GET = '[Dataset] get';
export const DATASET_GET_FAIL = '[Dataset] get fail';
export const DATASET_GET_SUCCESS = '[Dataset] get success';

export const DATASET_ADD = '[Dataset] add new';
export const DATASET_ADD_FAIL = '[Dataset] add new fail';
export const DATASET_ADD_SUCCESS = '[Dataset] add new success';

export const DATASET_UPDATE = '[Dataset] update';
export const DATASET_UPDATE_SUCCESS = '[Dataset] update success';

export const DATASET_ADD_COMMENT = '[Dataset] add new comment';
export const DATASET_ADD_COMMENT_FAIL = '[Dataset] add new comment fail';
export const DATASET_ADD_COMMENT_SUCCESS = '[Dataset] add new comment success';

export const DATASET_REMOVE = '[Dataset] remove';
export const DATASET_REMOVE_FAIL = '[Dataset] remove fail';
export const DATASET_REMOVE_SUCCESS = '[Dataset] remove success';

/* Dataset Get */
export class DatasetGet implements Action {
  readonly type = DATASET_GET;

  constructor(public payload: string) {}
}

export class DatasetGetSuccess implements Action {
  readonly type = DATASET_GET_SUCCESS;

  constructor(public payload: [IDataset]) {}
}

export class DatasetGetFail implements Action {
  readonly type = DATASET_GET_FAIL;

  constructor(public payload: string) {}
}

/* Dataset Add */
export class DatasetAdd implements Action {
  readonly type = DATASET_ADD;

  constructor(public payload: string) {}
}

export class DatasetAddSuccess implements Action {
  readonly type = DATASET_ADD_SUCCESS;

  constructor(public payload: IDataset) {}
}

export class DatasetAddFail implements Action {
  readonly type = DATASET_ADD_FAIL;

  constructor(public payload: string) {}
}

/* Dataset update */
export class DatasetUpdate implements Action {
  readonly type = DATASET_GET;
  _id: number;

  constructor(public payload: IDataset) {}
}

export class DatasetUpdateSuccess implements Action {
  readonly type = DATASET_UPDATE_SUCCESS;

  constructor(public payload: IDataset) {}
}

/* Dataset Add Comment */
export class DatasetAddComment implements Action {
  readonly type = DATASET_ADD_COMMENT;

  constructor(public payload: IDatasetComment) {}
}

export class DatasetAddCommentSuccess implements Action {
  readonly type = DATASET_ADD_COMMENT_SUCCESS;

  constructor(public payload: IDatasetComment) {}
}

export class DatasetAddCommentFail implements Action {
  readonly type = DATASET_ADD_COMMENT_FAIL;

  constructor(public payload: string) {}
}

/* Dataset Remove */
export class DatasetRemove implements Action {
  readonly type = DATASET_REMOVE;

  constructor(public payload: string) {}
}

export class DatasetRemoveSuccess implements Action {
  readonly type = DATASET_REMOVE_SUCCESS;

  constructor(public payload: IDataset) {}
}

export class DatasetRemoveFail implements Action {
  readonly type = DATASET_REMOVE_FAIL;

  constructor(public payload: string) {}
}

export type Actions =
  | DatasetGet
  | DatasetGetSuccess
  | DatasetGetFail
  | DatasetAdd
  | DatasetAddSuccess
  | DatasetAddFail
  | DatasetAddComment
  | DatasetAddCommentSuccess
  | DatasetAddCommentFail
  | DatasetRemove
  | DatasetRemoveSuccess
  | DatasetRemoveFail
  | DatasetUpdateSuccess
  | DatasetUpdate;
