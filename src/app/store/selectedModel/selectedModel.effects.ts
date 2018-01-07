import { Effect, Actions } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/share';

import {
  SELECTED_MODEL_GET, SELECTED_MODEL_SET, SELECTED_MODEL_REMOVE, SELECTED_MODEL_ADD_LAYER, SelectedModelGet, SelectedModelSet, SelectedModelSetFail, SelectedModelGetFail,
  SelectedModelGetSuccess, SelectedModelSetSuccess, SelectedModelAddLayer, SelectedModelAddLayerFail, SelectedModelAddLayerSuccess, SelectedModelRemove, 
  SelectedModelRemoveFail, SelectedModelRemoveSuccess, SelectedModelUpdateFail, SelectedModelUpdateSuccess, SelectedModelUpdate,
  SELECTED_MODEL_UPDATE, SELECTED_MODEL_UPDATE_FAIL, SELECTED_MODEL_UPDATE_SUCCESS, SELECTED_MODEL_UPDATE_LAYER, SelectedModelUpdateLayer, 
  SelectedModelUpdateLayerSuccess
} from './selectedModel.actions';
import { IModel, IModelLayer } from '../model/model.reducer';

@Injectable()
export class SelectedModelEffects {

    @Effect()
    setSelectedModel$ = this.actions$
        .ofType(SELECTED_MODEL_SET)
        .switchMap((action: SelectedModelSet) => {
            console.log ('setSelectedModel'); 
            return Observable.of(new SelectedModelSetSuccess(action.payload));
        }).share();

    // @Effect()
    // updateSelectedModel$ = this.actions$
    //     .ofType(SELECTED_MODEL_UPDATE)
    //     .switchMap((action: SelectedModelUpdate) => {
    //         console.log ('updateSelectedModel'); 
    //         return Observable.of(new SelectedModelUpdateSuccess(action.payload));
    //     }).share();

    @Effect()
    addLayerSelectedModel$ = this.actions$
        .ofType(SELECTED_MODEL_ADD_LAYER)
        .switchMap((action: SelectedModelAddLayer) => {
            console.log ('addLayerSelectedModel'); 
            const layer = new IModelLayer();
            layer._id = action.payload.newLayer._id;
            layer.layerType = action.payload.newLayer.layerType;
            layer.arguments = action.payload.newLayer.arguments;
            return Observable.of(new SelectedModelAddLayerSuccess(action.payload));
        }).share();

    // @Effect()
    // updateLayerSelectedModel$ = this.actions$
    //     .ofType(SELECTED_MODEL_UPDATE_LAYER)
    //     .switchMap((action: SelectedModelUpdateLayer) => {
    //         console.log ('SelectedModelUpdateLayer'); 
    //         const layer = new ISelectedModelLayer();
    //         layer._id = action.payload._id;
    //         layer.layerType = action.payload.layerType;
    //         layer.arguments = action.payload.arguments;
    //         return Observable.of(new SelectedModelUpdateLayerSuccess(layer));
    //     }).share();

  constructor(private actions$: Actions, private http: Http) {}
}
