import { NgSwitch, CommonModule } from '@angular/common';
import { NgModule, ChangeDetectorRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';

import 'rxjs/add/operator/take';
import 'rxjs/add/observable/interval';

import {DataSource} from '@angular/cdk/collections';

import { MODEL_GET, MODEL_ADD, MODEL_ADD_SUCCESS, MODEL_REMOVE, 
      MODEL_ADD_LAYER, MODEL_UPDATE, MODEL_UPDATE_SUCCESS } from '../store/model/model.actions';
import { ModelEffects } from '../store/model/model.effects';
import { IModel, IModelLayer } from '../store/model/model.reducer';
import { IDataset } from '../store/dataset/dataset.reducer';
import { DATASET_GET } from '../store/dataset/dataset.actions';
import { IAppState } from '../store';
import { SELECTED_MODEL_SET, SELECTED_MODEL_GET, SELECTED_MODEL_UPDATE, SELECTED_MODEL_REMOVE_LAYER,
  SELECTED_MODEL_UPDATE_LAYER, SELECTED_MODEL_ADD_LAYER } from '../store/selectedModel/selectedModel.actions';
import { ISelectedModel } from '../store/selectedModel/selectedModel.reducer';

import { EVALUATION_GET, EVALUATION_ADD, EVALUATION_ADD_SUCCESS, 
  EVALUATION_UPDATE, EVALUATION_UPDATE_SUCCESS } from '../store/evaluation/evaluation.actions';
import { EvaluationEffects } from '../store/evaluation/evaluation.effects';
import { IEvaluation } from '../store/evaluation/evaluation.reducer';

import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';

import {SelectModelComponent} from './selectModel/selectModel.component';
import {CreateModelComponent} from '../shared/createModel/createModel.component';
import {SelectDatasetComponent} from './selectDataset/selectDataset.component';
import { ChartSelectEvent } from 'ng2-google-charts';

/**
 * export interface IModel {
  _id: string;
  name: String;
  user: String;
  dataset: String;
  modelType: String;
  trainTestSplit: Number;
  inputColumns: [Number];
  outputColumns: [Number];
  layers: [{
      layerType: String, // eg Activation or Dense
      arguments: {} // varies per type, dynamic
  }],
  optimizer: String;
  loss: String;
  metrics: String;
  sample_weight_mode: String;
  weighted_metrics: String;
}
 */

@Component({
  selector: 'app-models',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.css']
})
export class ModelsComponent implements OnInit, OnDestroy, AfterViewInit {
  
  /**
   * Options for configuration.
   * TODO: these should be stored in a TYPE table.
   */
  ACTIVATIONS: string[] = [
    'elu', 
    'selu', 
    'softplus', 
    'softsign', 
    'relu', 
    'tanh', 
    'sigmoid', 
    'hard_sigmoid', 
    'linear', 
    'softmax',
    'NONE'
  ];
  INITIALIZERS: string[] = [
    'Zeros',
    'Ones',
    'Constant',
    'RandomNormal',
    'RandomUniform',
    'TruncatedNormal',
    'VarianceScaling',
    'Orthogonal',
    'Identity',
    'lecun_uniform',
    'glorot_normal',
    'glorot_uniform',
    'he_normal',
    'lecun_normal',
    'he_uniform',
    'NONE'
  ];
  REGULARIZERS: string[] = [
    'l1',
    'l2',
    'l1_l2',
    'NONE'
  ];
  CONSTRAINTS: string[] = [
    'max_norm',
    'non_neg',
    'unit_norm',
    'min_max_norm',
    'NONE'
  ];
  LAYER_TYPES: string[] = [
    'Dense',
    'Activation'
  ];
  LAYER_ARGUMENTS: object =  {
    'Dense' : [
        {
          name: 'units',
          type: 1,
        },
        {
          name: 'activation',
          type: this.ACTIVATIONS,
        },
        {
          name: 'use_bias',
          type: true
        },
        {
          name: 'kernel_initializer',
          type: this.INITIALIZERS
        },
        {
          name: 'bias_initializer',
          type: this.INITIALIZERS
        },
        {
          name: 'kernel_regularizer',
          type: this.REGULARIZERS
        },
        {
          name: 'bias_regularizer',
          type: this.REGULARIZERS
        },
        {
          name: 'activity_regularizer',
          type: this.REGULARIZERS
        },
        {
          name: 'kernel_constraint',
          type: this.CONSTRAINTS
        },
        {
          name: 'bias_constraint',
          type: this.CONSTRAINTS
        }
      ],
    'Activation': [
      {
        name: 'activation',
        type: this.ACTIVATIONS
      }
    ]
  };
  modelTypes: String[] = [
    'Regression',
    'Classification'
  ];
  optimizers: String[] = [
    'SGD',
    'RMSprop',
    'Adagrad',
    'Adadelta',
    'Adam',
    'Adamax',
    'Nadam',
    'TFOptimizer',
  ];
  losses: String[] = [
    'mean_squared_error',
    'mean_absolute_error',
    'mean_absolute_percentage_error',
    'mean_squared_logarithmic_error',
    'squared_hinge',
    'hinge',
    'categorical_hinge',
    'logcosh',
    'categorical_crossentropy',
    'sparse_categorical_crossentropy',
    'binary_crossentropy',
    'kullback_leibler_divergence',
    'poisson',
    'cosine_proximity',
  ];
  metrics: String[] = [
    'binary_accuracy',
    'categorical_accuracy',
    'sparse_categorical_accuracy',
    'top_k_categorical_accuracy',
    'sparse_top_k_categorical_accuracy',
    'mean_squared_error',
    'mean_absolute_error',
  ];
  crossValidationTypes: String[] = [
    "StratifiedKFold",
    "KFold",
  ];

  evaluationStore$: Store<IEvaluation[]>;
  sliderModels$: Observable<IModel[]>;
  evaluations$: Observable<IEvaluation[]>;
  sliderSelectedModel: IModel;
  showModal = false;
  form: FormGroup;
  editModel: FormGroup;
  crossValidationFormGroup: FormGroup;
  estimatorsFormGroup: FormGroup;
  layerControls: FormGroup[] = [];
  models$: Store<IModel[]>;
  selectedModel$: Store<ISelectedModel>;
  datasets$: Store<IDataset[]>;
  subs: Subscription[] = [];
  evaluationDataSource: EvaluationsDataSource;
  evaluationDisplayedColumns = [ 'worker', 'status'];
  chartDataSubscription: Subscription;
  metricsChartData = null;
  chartedEvaluations: IEvaluation[] = [];
  isLoading: Boolean;

  constructor(public fb: FormBuilder, 
              public store: Store<IAppState>, 
              private modelEffects: ModelEffects, 
              private router: Router,
              private route: ActivatedRoute,
              private cdRef: ChangeDetectorRef,
              public dialog: MatDialog,
              public snackBar: MatSnackBar) {
    this.models$ = store.select('model');
    this.datasets$ = store.select('dataset');
    this.selectedModel$ = store.select('selectedModel');
    this.evaluationStore$ = store.select('evaluation');

    // Forms are fully initialized on model select
    this.form = this.fb.group({
      name: ['', Validators.required],
    });
    this.estimatorsFormGroup = this.fb.group({
      StandardScaler: []
    });
    this.crossValidationFormGroup = this.fb.group({
      validator: [], // NONE, StratifiedKFold, KFold
      n_splits: [],
      shuffle: [],
    });
    this.editModel = this.fb.group({
      name: [],
      modelType: [],
      optimizer: [],
      metrics: [],
      loss: [],
      dataset: [],
      one_hot_encode_output: [],
      layers: [], // place holder
      inputColumns: [],
      outputColumns: [],
      epochs: [],
      batch_size: [],
      cross_validation: [], // place holder
      estimators: [], // place holder
    });

    this.sliderModels$ = this.selectedModel$.map((val) => {
      if (!val.selectedModel){
        return [];
      }
      console.log("sliderDates");
      const result: IModel[] = [];
      val.selectedModel.evaluations.forEach(element => {
        result.push(element.model_ref);
      });
      result.push(val.selectedModel);
      return result.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    });
  }

  onDateSliderInput(event, models: Array<IModel>): void {
    console.log('onDateSliderInput');
    this.store.dispatch({
      type: SELECTED_MODEL_UPDATE,
      sliderCurrentIndex: parseInt(event.value)
    });
    this.reset();
  }

  dateTextForIndex(models: Array<IModel>, i): String{
    if (!i){
      i = models.length - 1;
    }
    if (!models[i]) { return ''; }
    const date = new Date(models[i].updatedAt);
    return date.toISOString();
  }

  onCloseSelectDataset(): void{
    console.log('onCloseSelectDataset');
  }

  pickDataset(): void {
    console.log('pickDataset()');
    this.showModal = true;
  }

  selectedModelDataset(model: IModel): IDataset {
    return model.dataset;
  }

  ngOnInit(): void {
    this.store.dispatch({
      type: EVALUATION_GET
    });
    this.subs.push(this.route
      .queryParams
      .subscribe(params => {
        if (params['selectDataset']){
          console.log('dataset selected:',params['selectDataset']);
        }
      }));
    this.subs.push(this.modelEffects.addModel$
      .filter(action => action.type === MODEL_ADD_SUCCESS)
      .subscribe(res => {
          console.log('MODEL_ADD_SUCCESS', res);
          this.selectModel(res.payload);
      }));
    this.subs.push(this.modelEffects.updateModel$
      .filter(action => action.type === MODEL_UPDATE_SUCCESS)
      .subscribe(res => {
          console.log('MODEL_UPDATE_SUCCESS', res);
          this.selectModel(res.payload);
      }));
    this.subs.push(
      Observable.interval(20000)
      .subscribe(() => {
        console.log("get evals"); 
        this.store.dispatch({type: EVALUATION_GET});
      })
    );
    this.store.dispatch({
      type: MODEL_GET
    });
    this.store.dispatch({
      type: DATASET_GET
    });
    this.selectedModel$.take(1).subscribe(model => {
      if (model && model.selectedModel){
        console.log ("setting model on init");
        this.selectModel(model.selectedModel);
      }
    });
    this.reset();
  }

  ngAfterViewInit(): void{
    // this.selectedModel$.take(1).subscribe(model => {
    //   if (!model.selectedModel){
    //     this.openSelectModelDialog();
    //   }
    // });
  }

  submitModel(): void {
    if (this.form.valid) {
      this.store.dispatch({
        type: MODEL_ADD,
        payload: this.form.value,
      });

      this.reset();
    }
  }

  removeModel(model: IModel): void {
    this.store.dispatch({
      type: SELECTED_MODEL_SET,
      payload: null
    });
    this.store.dispatch({
      type: MODEL_REMOVE,
      payload: model._id
    });
    this.reset();
  }
 
  selectModel(model: IModel): void {
    this.isLoading = true;
    this.reset();
    this.store.dispatch({
      type: SELECTED_MODEL_SET,
      payload: model
    });
    if (!model) {
      return;
    }
    this.editModel.patchValue(model || {});
    if (model.cross_validation){
      this.crossValidationFormGroup.patchValue(model.cross_validation);
    }
    this.evaluations$ = this.evaluationStore$.map((evals) => {
      return evals.filter(evaluation => {
        return evaluation.model_ref._id === model._id;
      });
    });
    this.evaluationDataSource = new EvaluationsDataSource(this.evaluations$);
    if (this.chartDataSubscription){
      this.chartDataSubscription.unsubscribe();
    }
    this.chartDataSubscription = this.evaluations$.subscribe(evaluations => {
      this.chartedEvaluations = [];
      // evaluations = evaluations.filter(evaluation => {
      //   return evaluation.status === "DONE";
      // });
      if (evaluations.length <= 0) {
        return;
      }
      let names: String[] = ["X", model.modelType === "Classification" ? "Accuracy" : "Error"];
      // names.push("X");
      // names = names.concat(evaluations[0].metrics_names);
      const dataTable: any[] = [names];
      let i = 0;
      let acc_index = 0; 
      evaluations.forEach(evaluation => {
        this.chartedEvaluations.push(evaluation);
        if (evaluation.status === 'DONE'){
          evaluation.metrics_names.some(m => {
            if (/accuracy/.test(m.toLowerCase()) || /error/.test(m.toLowerCase())) {
              // Only showing Accuracy and Error for now.
              dataTable.push([i, evaluation.scores[evaluation.metrics_names.indexOf(m.valueOf())]]);
              return true;
            }
            return false;
          });
        } else {
          dataTable.push([i, null]);
        }
        ++i;
      });
      const columnsCount = Math.max(dataTable.length - 1, 20);
      this.metricsChartData = {
        chartType: 'LineChart',
        dataTable: dataTable,
        // [
          // ['X', 'Loss', 'Accuracy'], [0, 0, 0],    [1, 10, 5],   [2, 23, 15],  [3, 17, 9],   [4, 18, 10]
        // ],
        options: {
          'title': 'Metrics',
          'hAxis': {
            'gridlines': {
              'count': columnsCount
            },
            'maxValue': columnsCount,
          },
          'width': 900,
        },
      };
    });
    this.isLoading = false;
  }

  onLayerTypeChange(i: Number, layer: IModelLayer): Function {
    const _that = this;
    return function(val){
      console.log ('onLayerTypeChange', layer);
      _that.store.dispatch({
        type: SELECTED_MODEL_UPDATE_LAYER,
        payload: {
          i: i,
          layer: {
            arguments: layer.arguments,
            layerType: val
          }
        }
      });
    };
  }

  updateEditModel(model: IModel): void {
    const dataset = this.selectedModelDataset(model);
    if (dataset) {
      this.editModel.patchValue({dataset: dataset._id});
    }
    if (typeof this.crossValidationFormGroup.value.n_splits !== 'number') {
      let n_splits = parseInt(this.crossValidationFormGroup.value.n_splits);
      if (!n_splits) {
        n_splits = 2;
      }
      this.crossValidationFormGroup.patchValue({n_splits: n_splits});
    }
    if (typeof this.crossValidationFormGroup.value.shuffle !== "boolean") {
      this.crossValidationFormGroup.patchValue({
        shuffle: this.crossValidationFormGroup.value.shuffle ? 
          this.crossValidationFormGroup.value.shuffle.toLowerCase() === 'true' :
          'false'
      });
    }
    this.editModel.patchValue({
      estimators: Object.keys(this.estimatorsFormGroup.value)
                  .filter(key => {
                    return this.estimatorsFormGroup.value[key];
                  })
                  .map(key => {
                    return {name: key};
                  }),
      cross_validation: this.crossValidationFormGroup.value,
      layers: this.layerControls.map(c => {
        return {'layerType': c.value.modelType, 'arguments': c.value}
      }),
      outputColumns: this.editModel.get('outputColumns').value,
      inputColumns: this.editModel.get('inputColumns').value,
    });
  }

  updateModel(model: IModel): void {
    if (this.editModel.valid) {
      console.log ('updateModel');
      this.updateEditModel(model);
      // TODO: UI - screen clears briefly when saving model #1
      this.selectModel(null);
      this.store.dispatch({
        type: MODEL_UPDATE,
        payload: this.editModel.value,
        _id: model._id
      });
      this.reset();
    }
  }

  reset(): void{
    this.form.markAsPristine();
    this.editModel.markAsPristine();
    this.crossValidationFormGroup.markAsPristine();
    this.layerControls = [];
    this.metricsChartData = null;
  }

  ngOnDestroy(): void{
    this.subs.forEach(sub => {sub.unsubscribe(); });
  }

  typeOf(arg): string {
    return typeof arg;
  }

  layerControlForIndex(i: number, layer: IModelLayer): FormGroup {
    if (this.layerControls[i]){
      return this.layerControls[i];
    }
    console.log('creating new layerControl');
    const newControl = this.newLayerControl(i, layer);
    this.layerControls.push(newControl);
    return newControl;
  }

  newLayerControl(i: number, layer: IModelLayer): FormGroup {
    const _that = this;
    const control: FormGroup = this.fb.group({
      'modelType': [null],
      'units': [layer.arguments['units'] || 0],
      'activation': [null],
      'use_bias' : [null],
      'kernel_initializer': [''],
      'bias_initializer': [''],
      'kernel_regularizer': [''],
      'bias_regularizer': [''],
      'activity_regularizer': [''],
      'kernel_constraint': [''],
      'bias_constraint': [''],
    });
    return control;
  }
  
  onArgumentChange(i: number, layer: IModelLayer, formGroup: FormGroup, label): void {
    // if (layer.arguments[label] === formGroup.value[label]){
    //   return;
    // }
    // const _that = this;
    // let controlLoaded = true;
    // Object.keys(formGroup.value).forEach(k => {
    //   if (!formGroup.value[k]) {
    //     controlLoaded = false;
    //   }
    // });
    // if (controlLoaded){
    //   setTimeout(()=>{
    //     _that.store.dispatch({
    //       type: SELECTED_MODEL_UPDATE_LAYER,
    //       payload: {
    //         i: i,
    //         layer: {
    //           arguments: formGroup.value,
    //           layerType: layer.layerType
    //         }
    //       }
    //     });
    //   },0);
    // }
  }

  newDenseLayer(): { layerType: String, arguments: {} } {
    return {
      layerType: "Dense",
      arguments: {
        'units': 1,
        'activation': 'linear',
        'use_bias' : true,
        'kernel_initializer': "NONE",
        'bias_initializer': "NONE",
        'kernel_regularizer': "NONE",
        'bias_regularizer': "NONE",
        'activity_regularizer': "NONE",
        'kernel_constraint': "NONE",
        'bias_constraint': "NONE",
        }
      };
  }

  newLayer(model: IModel): void {
    this.updateEditModel(model);
    this.store.dispatch({
      type: SELECTED_MODEL_ADD_LAYER,
      payload: {
        newLayer: this.newDenseLayer(),
        model: this.editModel.value
      }
    });
  }

  removeLayer(layer, i): void{
    this.layerControls.splice(i, 1);
    this.store.dispatch({
      type: SELECTED_MODEL_REMOVE_LAYER,
      payload: layer,
      index: i
    });
  }

  objectKeys(obj): String[]{
    return Object.keys(obj);
  }

  createEvaluation(model: IModel){
    console.log("createEvaluation");
    this.store.dispatch({
      type: EVALUATION_ADD,
      payload: {
        modelID: model._id,
        model_ref: model
      }
    });
  }
  
  openCreateModelDialog(){
    let dialogRef = this.dialog.open(CreateModelComponent, {
      data: { 
        models$: this.models$,
        selectModel: this.selectModel
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      this.selectModel(result);
    });
  }
  
  openSelectModelDialog() {
    const dialogRef = this.dialog.open(SelectModelComponent, {
      data: { 
        models$: this.models$,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      this.selectModel(result);
    });
  }

  onSelectDatasetDialogOpen() {
    const dialogRef = this.dialog.open(SelectDatasetComponent, {
      data: { 
        datasets$: this.datasets$,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result){
        this.store.dispatch({
          type: SELECTED_MODEL_UPDATE,
          dataset: result
        });
      }
    });
  }

  diffModels(lhs, rhs): Object {
    return window['DeepDiff'].diff(
      lhs, rhs,
      function(p, k){
        return k === '_id' || k === 'updatedAt'
      }
    );
  }

  modelHasEstimator(model: IModel, estimator: String): Boolean {
    if (model && model.estimators && model.estimators.length > 0) {
      return model.estimators.some(est => {
        return est.name === estimator;
      });
    }
  }

  openSnackBar(message: string, action: string, duration: number) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }

  onChartSelect($event: ChartSelectEvent) {
    console.log($event);
    if ($event && typeof $event.row == 'number' && this.chartedEvaluations[$event.row]) {
      this.store.dispatch({
        type: SELECTED_MODEL_UPDATE,
        sliderCurrentIndex: $event.row
      });
      this.reset();
    }
  }

}

export class EvaluationsDataSource extends DataSource<any> {
  
    constructor(private data: Observable<IEvaluation[]>) {
      super()
    }
  
    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<IEvaluation[]> {
      return this.data;
    }

    disconnect() {}
}
