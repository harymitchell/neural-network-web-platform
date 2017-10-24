import { NgModule } from '@angular/core';

import { ModalComponent, ModalDirectivesDirective } from './modal/modal.component';
import { CommonModule } from '@angular/common';
import { TopNavigationComponent } from './top-navigation/top-navigation.component';
import { RouterModule } from '@angular/router';
import { SubNavigationComponent } from './sub-navigation/sub-navigation.component';
import { NotesComponent } from './notes/notes.component';
import { ButtonComponent } from './button/button.component';
import { InputComponent } from './input/input.component';
import { SelectComponent } from './select/select.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CardComponent } from './card/card.component';
import { LoaderComponent } from './loader/loader.component';
import { CreateEvaluationComponent } from './createEvaluation/createEvaluation.component';
import { CreateModelComponent } from './createModel/createModel.component';
import { GoogleChartComponent } from './googleChart/googleChart.component'
import {MatButtonModule, MatCardModule} from '@angular/material';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';

@NgModule({
  declarations: [
    GoogleChartComponent,
    ModalComponent,
    TopNavigationComponent,
    SubNavigationComponent,
    ModalDirectivesDirective,
    CardComponent,
    ButtonComponent,
    LoaderComponent,
    InputComponent,
    SelectComponent,
    NotesComponent,
    CreateEvaluationComponent,
    CreateModelComponent
  ],
  imports: [
    Ng2GoogleChartsModule,
    MatButtonModule,
    MatCardModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    GoogleChartComponent,
    ModalComponent,
    ModalDirectivesDirective,
    TopNavigationComponent,
    LoaderComponent,
    CardComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    SubNavigationComponent,
    NotesComponent,
    CreateEvaluationComponent,
    CreateModelComponent
  ]
})
export class SharedModule {}
