import {Component, Inject} from '@angular/core';

import { HttpHeaders } from '@angular/common/http';

import { Http, Response, ResponseOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Store } from '@ngrx/store';
import { IAppState } from '../../store';

import { IModel } from '../../store/model/model.reducer';

import {MatDialogRef, MAT_DIALOG_DATA, MatSelectModule, MatInputModule} from '@angular/material';

@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.css']
})
export class PredictionComponent  {
  contentType = '';
  inputData = '';
  output = '';
  
    constructor(
      public http: Http,
      public store: Store<IAppState>,
      public dialogRef: MatDialogRef<PredictionComponent>,
      @Inject(MAT_DIALOG_DATA) public data: {model: IModel}) { }
  
  sendPrediction(){
    console.log (`sending prediction for ${this.contentType} and ${this.inputData}`);
    let req = null;
    if (this.contentType.toLowerCase() === 'json'){
      let json
      try {
        json = JSON.parse(this.inputData)
      } catch (e){
        return console.error ('not valid JSON');
      }
      req = this.http.post('/api/model/deploy/' + this.data.model._id, {json: json});
    } else {
      req = this.http.post('/api/model/deploy/' + this.data.model._id, {csv: this.inputData});
    }

    if (!req) return;

    req
      .map((response: Response) => {
        return response.json();
      })
      .catch((error) => {
        console.error(error);
        return Observable.of(new Response(new ResponseOptions()));
      });

    req.subscribe(res => {
      console.log(res);
      try {
        this.output = JSON.stringify(JSON.parse(res._body), null, 2);;
      } catch(e){
        this.output = res._body;
      }
    }, err => {
      console.error(err);
      this.output = err;
    })
  }
}
