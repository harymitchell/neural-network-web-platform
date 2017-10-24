import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {DataSource} from '@angular/cdk/collections';

import { DATASET_GET, DATASET_ADD, DATASET_REMOVE, DATASET_ADD_COMMENT, DATASET_UPDATE } from '../store/dataset/dataset.actions';
import { IDataset } from '../store/dataset/dataset.reducer';
import { IAppState } from '../store';

@Component({
  selector: 'app-datasets',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.css']
})
export class DatasetsComponent implements OnInit{
  datasetsDataSource: DatasetsDataSource;
  selectedDatasetSource: SelectedDatasetSource;
  displayedColumns = [ 'name', 'createdAt'];
  selectedDatasetSourceDisplayedColumns = [];

  form: FormGroup;
  editDataset: FormGroup;
  formData:FormData;
  columnSpecForm: FormGroup; 
  selectedDataset: IDataset;
  datasets$: Store<IDataset[]>;
  selectedDatasetKeys: string[];
  
  constructor(public fb: FormBuilder, public store: Store<IAppState>) {
    this.datasets$ = store.select('dataset');
    this.form = fb.group({
      name: ['', Validators.required],
      uploadFile: ['', Validators.required],
      hasHeaders: [true],
      delimiter: [',']
    });
    this.editDataset = fb.group({
      name: [],
      columnSpec: []
    });
    this.columnSpecForm = fb.group({});
    this.datasetsDataSource = new DatasetsDataSource(this.datasets$);
  }

  fileChange(event) {
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
        let file: File = fileList[0];
        this.formData = new FormData();
        this.formData.append('uploadFile', file, file.name);
        this.form.patchValue({'uploadFile': this.formData, 'name': this.form.value.name});
    }
  }

  ngOnInit(): void {
    this.store.dispatch({
      type: DATASET_GET
    });
    this.reset();
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

  submitCommentOnDataset(id: string, commentForm: FormGroup): void {

    if (commentForm.valid) {

      this.store.dispatch({
        type: DATASET_ADD_COMMENT,
        payload: {
          id,
          comment: commentForm.value
        }
      });

      commentForm.reset();
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
