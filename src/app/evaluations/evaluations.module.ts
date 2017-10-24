import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { EvaluationsComponent } from './evaluations.component';
import { routes } from './evaluations.router';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import {MatCardModule, MatTableModule, MatButtonModule} from '@angular/material';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';

@NgModule({
  imports: [
    Ng2GoogleChartsModule,
    MatCardModule,
    MatTableModule, 
    MatButtonModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    EvaluationsComponent
  ],
  bootstrap: [
    EvaluationsComponent
  ]
})
export class EvaluationsModule {}
