import { IEvaluation } from './evaluation.reducer';
import { Action } from '@ngrx/store';

export const EVALUATION_GET = '[Evaluation] get';
export const EVALUATION_GET_FAIL = '[Evaluation] get fail';
export const EVALUATION_GET_SUCCESS = '[Evaluation] get success';

export const EVALUATION_ADD = '[Evaluation] add new';
export const EVALUATION_ADD_FAIL = '[Evaluation] add new fail';
export const EVALUATION_ADD_SUCCESS = '[Evaluation] add new success';

export const EVALUATION_UPDATE = '[Evaluation] update';
export const EVALUATION_UPDATE_FAIL = '[Evaluation] update fail';
export const EVALUATION_UPDATE_SUCCESS = '[Evaluation] update success';

/* Evaluation Get */
export class EvaluationGet implements Action {
  readonly type = EVALUATION_GET;

  constructor(public payload: string) {}
}

export class EvaluationGetSuccess implements Action {
  readonly type = EVALUATION_GET_SUCCESS;

  constructor(public payload: IEvaluation[]) {}
}

export class EvaluationGetFail implements Action {
  readonly type = EVALUATION_GET_FAIL;

  constructor(public payload: string) {}
}

/* Evaluation Add */
export class EvaluationAdd implements Action {
  readonly type = EVALUATION_ADD;

  constructor(public payload: IEvaluation) {}
}

export class EvaluationAddSuccess implements Action {
  readonly type = EVALUATION_ADD_SUCCESS;

  constructor(public payload: IEvaluation) {}
}

export class EvaluationAddFail implements Action {
  readonly type = EVALUATION_ADD_FAIL;

  constructor(public payload: string) {}
}


/* Evaluation Update */
export class EvaluationUpdate implements Action {
  readonly type = EVALUATION_UPDATE;
  _id: Number;

  constructor(public payload: IEvaluation) {}
}

export class EvaluationUpdateSuccess implements Action {
  readonly type = EVALUATION_UPDATE_SUCCESS;

  constructor(public payload: IEvaluation) {}
}

export class EvaluationUpdateFail implements Action {
  readonly type = EVALUATION_UPDATE_FAIL;

  constructor(public payload: string) {}
}

export type Actions =
  | EvaluationGet
  | EvaluationGetSuccess
  | EvaluationGetFail
  | EvaluationAdd
  | EvaluationAddSuccess
  | EvaluationAddFail
  | EvaluationUpdateFail
  | EvaluationUpdateSuccess
  | EvaluationUpdate;
