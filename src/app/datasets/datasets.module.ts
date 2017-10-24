import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DatasetsComponent } from './datasets.component';
import { routes } from './datasets.router';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';

import {MatTableModule} from '@angular/material';

@NgModule({
  imports: [
    MatTableModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    DatasetsComponent
  ],
  bootstrap: [
    DatasetsComponent
  ]
})
export class DatasetsModule {}
