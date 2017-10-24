import { Effect, Actions } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/share';

import {
  MODEL_GET, MODEL_ADD, MODEL_REMOVE, MODEL_ADD_LAYER, ModelGet, ModelAdd, ModelAddFail, ModelGetFail,
  ModelGetSuccess, ModelAddSuccess, ModelAddLayer, ModelAddLayerFail, ModelAddLayerSuccess, ModelRemove, 
  ModelRemoveFail, ModelRemoveSuccess, ModelUpdateFail, ModelUpdateSuccess, ModelUpdate,
  MODEL_UPDATE, MODEL_UPDATE_FAIL, MODEL_UPDATE_SUCCESS
} from './model.actions';

@Injectable()
export class ModelEffects {

  @Effect()
  getModel$ = this.actions$
    .ofType(MODEL_GET)
    .switchMap((action: ModelGet) => {

      return this.http.get('/api/model', action.payload)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new ModelGetFail(error)))
        .map((response) => new ModelGetSuccess(response));

    }).share();

  @Effect()
  addModel$ = this.actions$
    .ofType(MODEL_ADD)
    .switchMap((action: ModelAdd) => {
      console.log ("addModel"); 
      return this.http.post('/api/model', action.payload)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new ModelAddFail(error)))
        .map((response) => new ModelAddSuccess(response));

    }).share();

  @Effect()
  addModelLayer$ = this.actions$
    .ofType(MODEL_ADD_LAYER)
    .switchMap((action: ModelAddLayer) => {

      return this.http.post('/api/model/' + action.payload._id + '/layer', action.payload)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new ModelAddLayerFail(error)))
        .map((response) => new ModelAddLayerSuccess(response));

    }).share();

  @Effect()
  removeModel$ = this.actions$
    .ofType(MODEL_REMOVE)
    .switchMap((action: ModelRemove) => {

      return this.http.delete('/api/model/' + action.payload)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new ModelRemoveFail(error)))
        .map((response) => new ModelRemoveSuccess(response));

    }).share();

  @Effect()
  updateModel$ = this.actions$
    .ofType(MODEL_UPDATE)
    .switchMap((action: ModelUpdate) => {

      return this.http.post('/api/model/' + action._id, action.payload)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new ModelUpdateFail(error)))
        .map((response) => new ModelUpdateSuccess(response));

    }).share();

  constructor(private actions$: Actions, private http: Http) {}
}
