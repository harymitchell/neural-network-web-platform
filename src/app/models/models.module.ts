import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ModelsComponent } from './models.component';
import { routes } from './models.router';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { SelectDatasetComponent } from './selectDataset/selectDataset.component';
import { SelectModelComponent } from './selectModel/selectModel.component';
import { PredictionComponent } from './prediction/prediction.component';

import { Ng2GoogleChartsModule } from 'ng2-google-charts';

import { MatCardModule, MatTableModule, MatButtonModule, MatProgressSpinnerModule,
  MatSidenavModule, MatDialogModule, MatTabsModule, MatIconModule, MatSliderModule,
  MatMenuModule, MatExpansionModule, MatSnackBarModule, MatSelectModule,
  MatInputModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule, 
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatDialogModule,
    MatTabsModule,
    MatIconModule,
    MatSliderModule,
    MatMenuModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatSelectModule,
    MatInputModule,

    Ng2GoogleChartsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    SelectDatasetComponent,
    SelectModelComponent,
    ModelsComponent,
    PredictionComponent
  ],
  bootstrap: [
    ModelsComponent,
  ],
  entryComponents: [ SelectModelComponent, PredictionComponent ], 
})
export class ModelsModule {}
