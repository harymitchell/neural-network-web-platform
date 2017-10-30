import { Effect, Actions } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/share';

import {
  DATASET_GET, DATASET_ADD, DATASET_REMOVE, DATASET_ADD_COMMENT, DatasetGet, DatasetAdd, DatasetAddFail, DatasetGetFail,
  DatasetGetSuccess, DatasetAddSuccess, DatasetAddComment, DatasetAddCommentFail, DatasetAddCommentSuccess, DatasetRemove, 
  DatasetRemoveFail, DatasetRemoveSuccess, DatasetUpdateSuccess, DatasetUpdate, DATASET_UPDATE, DATASET_UPDATE_SUCCESS,
  DATASET_ADD_SUCCESS, DATASET_ADD_FAIL, DatasetUpdateFail
} from './dataset.actions';

@Injectable()
export class DatasetEffects {

  @Effect()
  getDataset$ = this.actions$
    .ofType(DATASET_GET)
    .switchMap((action: DatasetGet) => {

      return this.http.get('/api/dataset', action.payload)
        .map((response: Response) => response.json())
        .map((response) => new DatasetGetSuccess(response))
        .catch((error) => Observable.of(new DatasetGetFail(error)));

    })
    .share();

  @Effect()
  addDataset$ = this.actions$
    .ofType(DATASET_ADD)
    .switchMap((action: DatasetAdd) => {
      console.log ("addDataset"); 
      return this.http.post('/api/dataset', action.payload)
        .map((response: Response) => response.json())
        .map((response) => new DatasetAddSuccess(response))
        .catch((error) => Observable.of(new DatasetAddFail(error)));

    })
    .share();


  @Effect()
  updateDataset$ = this.actions$
    .ofType(DATASET_UPDATE)
    .switchMap((action: DatasetUpdate) => {
      console.log ("updateDataset"); 
      return this.http.put('/api/dataset/' + action._id, action.payload)
        .map((response: Response) => response.json())
        .map((response) => new DatasetUpdateSuccess(response))
        .catch((error) => Observable.of(new DatasetUpdateFail(error)));

    })
    .share();

  @Effect()
  removeDataset$ = this.actions$
    .ofType(DATASET_REMOVE)
    .switchMap((action: DatasetRemove) => {

      return this.http.delete('/api/dataset/' + action.payload)
        .map((response: Response) => response.json())
        .map((response) => new DatasetRemoveSuccess(response))
        .catch((error) => Observable.of(new DatasetRemoveFail(error)));

    })
    .share();

  constructor(private actions$: Actions, private http: Http) {}
}
