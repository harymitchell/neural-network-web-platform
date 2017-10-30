import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {DataSource} from '@angular/cdk/collections';

import { Subscription } from 'rxjs/Subscription';
import { DATASET_GET, DATASET_ADD, DATASET_ADD_SUCCESS, 
  DATASET_REMOVE, DATASET_UPDATE, DATASET_ADD_FAIL, DATASET_UPDATE_SUCCESS, 
  DATASET_UPDATE_FAIL, DATASET_GET_FAIL, DATASET_GET_SUCCESS } from '../store/dataset/dataset.actions';
import { DatasetEffects } from '../store/dataset/dataset.effects';
import { IDataset } from '../store/dataset/dataset.reducer';
import { IAppState } from '../store';

import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-datasets',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.css']
})
export class DatasetsComponent implements OnInit, OnDestroy{
  datasetsDataSource: DatasetsDataSource;
  selectedDatasetSource: SelectedDatasetSource;
  displayedColumns = [ 'name', 'createdAt'];
  selectedDatasetSourceDisplayedColumns = [];
  subs: Subscription[] = [];  
  form: FormGroup;
  editDataset: FormGroup;
  formData:FormData;
  columnSpecForm: FormGroup; 
  selectedDataset: IDataset;
  datasets$: Store<IDataset[]>;
  selectedDatasetKeys: string[];
  
  constructor(public fb: FormBuilder, public store: Store<IAppState>, 
    public snackBar: MatSnackBar, private datasetEffects: DatasetEffects, ) {
    // build current
    this.datasets$ = store.select('dataset');
    this.form = fb.group({
      name: ['', Validators.required],
      uploadFile: ['', this.validateFileSize],
      hasHeaders: [true],
      delimiter: [',']
    });
    this.editDataset = fb.group({
      name: ['', Validators.required],
      columnSpec: []
    });
    this.columnSpecForm = fb.group({});
    this.datasetsDataSource = new DatasetsDataSource(this.datasets$);

    this.subs.push(this.datasetEffects.addDataset$
      .subscribe(res => {
         switch (res.type){
          case DATASET_ADD_FAIL:
            this.snackBar.open('Failed to Add Dataset', 'OK', {
              duration: 6000,
            });
            break;

          case DATASET_ADD_SUCCESS:
            this.snackBar.open('Dataset Added Successfully', 'OK', {
              duration: 6000,
            });
            break;
        }
      }));

    this.subs.push(this.datasetEffects.updateDataset$
      .subscribe(res => {
         switch (res.type){
          case DATASET_UPDATE_FAIL:
            this.snackBar.open('Failed to Update Dataset', 'OK', {
              duration: 6000,
            });
            break;

          case DATASET_UPDATE_SUCCESS:
            this.snackBar.open('Dataset Updated Successfully', 'OK', {
              duration: 6000,
            });
            break;
        }
      }));


    this.subs.push(this.datasetEffects.getDataset$
      .subscribe(res => {
         switch (res.type){
          case DATASET_GET_FAIL:
            this.snackBar.open('Failed to Retrieve Datasets', 'OK', {
              duration: 6000,
            });
            break;

          case DATASET_GET_SUCCESS:
            this.snackBar.open('Dataset Retrieved Successfully', 'OK', {
              duration: 6000,
            });
            break;
        }
      }));
  }

  validateFileSize(c: FormControl) {
    return c.value && c.value.get('uploadFile') && (c.value.get('uploadFile').size / 1024 / 1024 <= 25) ? null : {
      validateFileSize: {
        valid: false
      }
    };
  }

  fileChange(event) {
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
        let file: File = fileList[0];
        this.formData = new FormData();
        this.formData.append('uploadFile', file, file.name);
        this.form.patchValue({'uploadFile': this.formData, 'name': this.form.value.name});
        if (file.size / 1024 / 1024 > 25){
          this.snackBar.open("File must be 25mb or smaller", "OK", {
            duration: 6000,
          });
        }
    }
  }

  ngOnInit(): void {
    this.store.dispatch({
      type: DATASET_GET
    });
    this.reset();
  }

  ngOnDestroy(): void{
    this.subs.forEach(sub => {sub.unsubscribe(); });
  }

  submitDataset(): void {

    if (this.form.valid) {
      this.formData.append('name', this.form.value.name);
      this.formData.append('hasHeaders', this.form.value.hasHeaders);
      this.formData.append('delimiter', this.form.value.delimiter.replace('TAB', '\t').replace('SPACE', ' '));
      this.store.dispatch({
        type: DATASET_ADD,
        payload: this.formData,
      });

      this.reset();
    }
  }

  removeDataset(dataset: IDataset): void {
    this.store.dispatch({
      type: DATASET_REMOVE,
      payload: dataset._id
    });
    this.reset();
  }

  selectDataset(dataset: IDataset): void{
    this.editDataset = this.fb.group({
      name: [dataset.name],
      columnSpec: []
    });
    this.selectedDataset = dataset;
    this.selectedDatasetKeys = Object.keys(dataset.data[0]);
    const columnSpecFormSpec = {};
    this.selectedDatasetKeys.forEach(k => {
      columnSpecFormSpec[k] = [this.selectedDataset.columnSpec && this.selectedDataset.columnSpec[k] 
                                ? this.selectedDataset.columnSpec[k].dataType
                                : ''];
    });
    this.columnSpecForm = this.fb.group(columnSpecFormSpec);
    this.selectedDatasetSource = new SelectedDatasetSource(this.selectedDataset);
    this.selectedDatasetSourceDisplayedColumns = this.selectedDatasetKeys;
    console.log(dataset);
  }

  updateDataset(dataset: IDataset): void{
    if (!this.editDataset.get('name').value){
      this.editDataset.patchValue({name: dataset.name});
    }
    const _that = this;
    this.editDataset.patchValue({
      columnSpec:
        Object.keys(_that.columnSpecForm.value).reduce(function(previous, current) {
          if (_that.columnSpecForm.value[current]) {
            previous[current] = {dataType: _that.columnSpecForm.value[current]};
          }
          return previous;
        }, {})
    });
    this.store.dispatch({
      type: DATASET_UPDATE,
      payload: this.editDataset.value,
      _id: dataset._id,
    });
  }

  columnDType(selectedDataset: IDataset, col: String): String{
    if (selectedDataset && selectedDataset.columnSpec && selectedDataset.columnSpec[col.valueOf()]) {
      return selectedDataset.columnSpec[col.valueOf()]['dataType'] || '';
    }
    return '';
  }

  reset(): void{
    this.form.reset();
    this.editDataset.reset();
    this.selectedDataset = null;
    this.selectedDatasetKeys = null;
  }
}

export class DatasetsDataSource extends DataSource<any> {
    constructor(private data: Observable<IDataset[]>) {
      super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<IDataset[]> {
      return this.data;
    }
    disconnect() {}
  }

export class SelectedDatasetSource extends DataSource<any> {

      constructor(private dataset: IDataset) {
        super();
      }

      /** Connect function called by the table to retrieve one stream containing the data to render. */
      connect(): Observable<any> {
        return new Observable(observer => {
          observer.next(this.dataset.data);
        });
      }
      disconnect() {}
}
