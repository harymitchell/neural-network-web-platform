import { Route } from '@angular/router';
import { ModelsComponent } from './models.component';
import { SelectDatasetComponent } from './selectDataset/selectDataset.component';
import { CreateEvaluationComponent } from '../shared/createEvaluation/createEvaluation.component';
import { CreateModelComponent } from '../shared/createModel/createModel.component';

export const routes: Route[] = [
  {
    path: '',
    component: ModelsComponent
  },
  {
    path: 'selectDataset',
    component: SelectDatasetComponent,
    outlet: 'modal'
  },
  {
    path: 'createEvaluation',
    component: CreateEvaluationComponent,
    outlet: 'modal'
  },
  {
    path: 'createModel',
    component: CreateModelComponent,
    outlet: 'modal'
  }
];
