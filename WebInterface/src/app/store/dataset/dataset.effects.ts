import { Effect, Actions } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';

import {
  DATASET_GET, DATASET_ADD, DATASET_REMOVE, DATASET_ADD_COMMENT, DatasetGet, DatasetAdd, DatasetAddFail, DatasetGetFail,
  DatasetGetSuccess, DatasetAddSuccess, DatasetAddComment, DatasetAddCommentFail, DatasetAddCommentSuccess, DatasetRemove, 
  DatasetRemoveFail, DatasetRemoveSuccess, DatasetUpdateSuccess, DatasetUpdate, DATASET_UPDATE, DATASET_UPDATE_SUCCESS
} from './dataset.actions';

@Injectable()
export class DatasetEffects {

  @Effect()
  getDataset$ = this.actions$
    .ofType(DATASET_GET)
    .switchMap((action: DatasetGet) => {

      return this.http.get('/api/dataset', action.payload)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new DatasetGetFail(error)))
        .map((response) => new DatasetGetSuccess(response));

    });

  @Effect()
  addDataset$ = this.actions$
    .ofType(DATASET_ADD)
    .switchMap((action: DatasetAdd) => {
      console.log ("addDataset"); 
      return this.http.post('/api/dataset', action.payload)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new DatasetAddFail(error)))
        .map((response) => new DatasetAddSuccess(response));

    });


  @Effect()
  updateDataset$ = this.actions$
    .ofType(DATASET_UPDATE)
    .switchMap((action: DatasetUpdate) => {
      console.log ("updateDataset"); 
      return this.http.put('/api/dataset/' + action._id, action.payload)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new DatasetAddFail(error)))
        .map((response) => new DatasetUpdateSuccess(response));

    });

  @Effect()
  addDatasetComment$ = this.actions$
    .ofType(DATASET_ADD_COMMENT)
    .switchMap((action: DatasetAddComment) => {

      return this.http.post('/api/dataset/' + action.payload.id + '/comment', action.payload.comment)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new DatasetAddCommentFail(error)))
        .map((response) => new DatasetAddCommentSuccess(response));

    });

  @Effect()
  removeDataset$ = this.actions$
    .ofType(DATASET_REMOVE)
    .switchMap((action: DatasetRemove) => {

      return this.http.delete('/api/dataset/' + action.payload)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new DatasetRemoveFail(error)))
        .map((response) => new DatasetRemoveSuccess(response));

    });

  constructor(private actions$: Actions, private http: Http) {}
}
