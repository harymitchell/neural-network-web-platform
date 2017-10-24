import { Effect, Actions } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/toPromise';

import {
  FEED_GET, FEED_ADD, FEED_REMOVE, FEED_ADD_COMMENT, FeedGet, FeedAdd, FeedAddFail, FeedGetFail,
  FeedGetSuccess, FeedAddSuccess, FeedAddComment, FeedAddCommentFail, FeedAddCommentSuccess, FeedRemove, FeedRemoveFail,
  FeedRemoveSuccess
} from './feed.actions';

@Injectable()
export class FeedEffects {

  @Effect()
  getFeed$ = this.actions$
    .ofType(FEED_GET)
    .switchMap((action: FeedGet) => {

      return this.http.get('/api/feed', action.payload)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new FeedGetFail(error)))
        .map((response) => new FeedGetSuccess(response));

    });

  @Effect()
  addFeed$ = this.actions$
    .ofType(FEED_ADD)
    .switchMap((action: FeedAdd) => {
      console.log ("addFeed");
      return this.http.post('/api/feed', action.payload)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new FeedAddFail(error)))
        .map((response) => new FeedAddSuccess(response));

    });

  @Effect()
  addFeedComment$ = this.actions$
    .ofType(FEED_ADD_COMMENT)
    .switchMap((action: FeedAddComment) => {

      return this.http.post('/api/feed/' + action.payload.id + '/comment', action.payload.comment)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new FeedAddCommentFail(error)))
        .map((response) => new FeedAddCommentSuccess(response));

    });

  @Effect()
  removeFeed$ = this.actions$
    .ofType(FEED_REMOVE)
    .switchMap((action: FeedRemove) => {

      return this.http.delete('/api/feed/' + action.payload)
        .map((response: Response) => response.json())
        .catch((error) => Observable.of(new FeedRemoveFail(error)))
        .map((response) => new FeedRemoveSuccess(response));

    });

  constructor(private actions$: Actions, private http: Http) {}
}
