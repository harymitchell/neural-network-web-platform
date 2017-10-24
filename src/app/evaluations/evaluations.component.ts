import { NgSwitch, CommonModule } from '@angular/common';
import { NgModule, ChangeDetectorRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';

import 'rxjs/add/operator/take';

import { EVALUATION_GET, EVALUATION_ADD, EVALUATION_ADD_SUCCESS, 
       EVALUATION_UPDATE, EVALUATION_UPDATE_SUCCESS } from '../store/evaluation/evaluation.actions';
import { EvaluationEffects } from '../store/evaluation/evaluation.effects';
import { IEvaluation } from '../store/evaluation/evaluation.reducer';
import { IDataset } from '../store/dataset/dataset.reducer';
import { DATASET_GET } from '../store/dataset/dataset.actions';
import { IAppState } from '../store';
import {DataSource} from '@angular/cdk/collections';

@Component({
  selector: 'app-evaluations',
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.css']
})
export class EvaluationsComponent implements OnInit {
  pieChartData =  {
    chartType: 'PieChart',
    dataTable: [
      ['Task', 'Hours per Day'],
      ['Work',     11],
      ['Eat',      2],
      ['Commute',  2],
      ['Watch TV', 2],
      ['Sleep',    7]
    ],
    options: {'title': 'Tasks'},
  };
  public tableChartData =  {
    chartType: 'Table',
    dataTable: [
      ['Department', 'Revenues', 'Another column'],
      ['Shoes', 10700, -100],
      ['Sports', -15400, 25],
      ['Toys', 12500, 40],
      ['Electronics', -2100, 889],
      ['Food', 22600, 78],
      ['Art', 1100, 42]
    ],
    formatters: [
      {
        columns: [1, 2],
        type: 'NumberFormat',
        options: {
          prefix: '&euro;', negativeColor: '#FF0000', negativeParens: true
        }
      }
    ],
    options: {title: 'Countries', allowHtml: true}
  };

  displayedColumns = [ 'worker', 'status'];

  evaluations$: Store<IEvaluation[]>;
  dataSource: ExampleDataSource;

  constructor(public fb: FormBuilder, 
              public store: Store<IAppState>, 
              private evaluationEffects: EvaluationEffects, 
              private router: Router,
              private ref: ChangeDetectorRef) {
    this.evaluations$ = store.select('evaluation');
    this.dataSource = new ExampleDataSource(this.evaluations$);
  }

  ngOnInit(){
    this.store.dispatch({
      type: EVALUATION_GET
    });
  }

}

export class ExampleDataSource extends DataSource<any> {

  constructor(private data: Observable<IEvaluation[]>) {
    super()
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<IEvaluation[]> {
    return this.data
  }

  disconnect() {}
}