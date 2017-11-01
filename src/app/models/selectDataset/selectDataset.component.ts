import {Component, Inject} from '@angular/core';

import { Store } from '@ngrx/store';
import { IDataset } from '../../store/dataset/dataset.reducer';

import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-select-dataset',
  templateUrl: './selectDataset.component.html',
  styleUrls: ['./selectDataset.component.css']
})
export class SelectDatasetComponent  {
  datasets$: Store<IDataset[]>;
  
    constructor(public dialogRef: MatDialogRef<SelectDatasetComponent>,
       @Inject(MAT_DIALOG_DATA) public data: {datasets$: Store<IDataset[]>}) { }
  
    selectDataset(dataset: IDataset): void{
      this.dialogRef.close(dataset);
    }
}
