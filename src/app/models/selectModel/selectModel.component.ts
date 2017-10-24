import {Component, Inject} from '@angular/core';

import { Store } from '@ngrx/store';
import { IModel, IModelLayer } from '../../store/model/model.reducer';

import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'your-dialog-selector',
  template: `
  <div class="w3-container">
    <h3 style="text-align: center">Models</h3>
    <ul class="w3-ul w3-card-2" style="width:100%">
      <li *ngFor="let item of data.models$ | async"
          (click)="selectModel(item)">{{item.name}}</li>
    </ul>
  </div>
  `
})
export class SelectModelComponent {
  models$: Store<IModel[]>;

  constructor(public dialogRef: MatDialogRef<SelectModelComponent>, @Inject(MAT_DIALOG_DATA) public data: {models$: Store<IModel[]>}) { }

  selectModel(model: IModel): void{
    this.dialogRef.close(model);
  }
}