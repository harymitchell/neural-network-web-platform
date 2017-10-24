import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../../store';
import { IDataset } from '../../store/dataset/dataset.reducer';
import { DATASET_GET } from '../../store/dataset/dataset.actions';
import { ActivatedRoute, Router } from '@angular/router';

import { SELECTED_MODEL_SET, SELECTED_MODEL_GET, SELECTED_MODEL_UPDATE, SELECTED_MODEL_REMOVE_LAYER,
  SELECTED_MODEL_UPDATE_LAYER, SELECTED_MODEL_ADD_LAYER } from '../../store/selectedModel/selectedModel.actions';

@Component({
  selector: 'app-select-dataset',
  templateUrl: './selectDataset.component.html',
  styleUrls: ['./selectDataset.component.css']
})
export class SelectDatasetComponent implements OnInit {
  routerLink: String = "/models";
  datasets$: Store<IDataset[]>;

  constructor(public store: Store<IAppState>, private router: Router) {
    this.datasets$ = store.select('dataset');
  }

  ngOnInit() {
    this.store.dispatch({
      type: DATASET_GET
    });
  }

  selectDataset(item: IDataset): void{
    console.log("selectDataset");
    this.store.dispatch({
      type: SELECTED_MODEL_UPDATE,
      dataset: item
    });
    this.router.navigate(['/models'], { queryParams: { selectDataset: item._id } });
  }
}
