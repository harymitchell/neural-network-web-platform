import { Effect, Actions } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/share';

import {
  EVALUATION_GET, EVALUATION_ADD, EvaluationGet, EvaluationAdd, EvaluationAddFail, EvaluationGetFail,
  EvaluationGetSuccess, EvaluationAddSuccess, 
  EvaluationUpdateFail, EvaluationUpdateSuccess, EvaluationUpdate,
  EVALUATION_UPDATE, EVALUATION_UPDATE_FAIL, EVALUATION_UPDATE_SUCCESS
} from './evaluation.actions';

@Injectable()
export class EvaluationEffects {

  @Effect()
  getEvaluation$ = this.actions$
    .ofType(EVALUATION_GET)
    .switchMap((action: EvaluationGet) => {

      return this.http.get('/api/evaluation', action.payload)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new EvaluationGetFail(error)))
        .map((response) => new EvaluationGetSuccess(response));

    }).share();

  @Effect()
  addEvaluation$ = this.actions$
    .ofType(EVALUATION_ADD)
    .switchMap((action: EvaluationAdd) => {
      console.log ("addEvaluation"); 
      return this.http.post('/api/evaluation', action.payload)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new EvaluationAddFail(error)))
        .map((response) => new EvaluationAddSuccess(response));

    }).share();


  @Effect()
  updateEvaluation$ = this.actions$
    .ofType(EVALUATION_UPDATE)
    .switchMap((action: EvaluationUpdate) => {

      return this.http.post('/api/evaluation/' + action._id, action.payload)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new EvaluationUpdateFail(error)))
        .map((response) => new EvaluationUpdateSuccess(response));

    }).share();

  constructor(private actions$: Actions, private http: Http) {}
}
