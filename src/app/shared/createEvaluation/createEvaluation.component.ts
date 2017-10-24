import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../../store';
import { IModel } from '../../store/model/model.reducer';
import { IEvaluation } from '../../store/evaluation/evaluation.reducer';
import { EVALUATION_ADD } from '../../store/evaluation/evaluation.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-select-dataset',
  templateUrl: './createEvaluation.component.html',
  styleUrls: ['./createEvaluation.component.css']
})
export class CreateEvaluationComponent implements OnInit {
  routerLink: String;
  evaluations$: Store<IEvaluation[]>; 
  createEvaluationForm: FormGroup;
  subs: Array<Subscription>; 
  modelID: String;

  constructor(public store: Store<IAppState>, private router: Router, 
    private fb: FormBuilder,
    private route: ActivatedRoute,) {

      this.evaluations$ = store.select('evaluation');
      this.createEvaluationForm = fb.group({
        batch_size: [100, Validators.required],
        epochs: [100, Validators.required],
        modelID: []
      });
      this.route
        .queryParams
        .subscribe(params => {
          if (params['routerLink']){
            console.log('routerLink:',params['routerLink']);
            this.routerLink = params['routerLink'];
          }
          if (params['modelID']){
            console.log('modelID:',params['modelID']);
            this.modelID = params['modelID']
            this.createEvaluationForm.patchValue ({modelID: params['modelID']});
          }
        });
  }

  ngOnInit() {

  }

  createEvaluation(): void{
    console.log("createEvaluation");
    this.store.dispatch({
      type: EVALUATION_ADD,
      payload: this.createEvaluationForm.value
    });
    this.router.navigate([this.routerLink], { queryParams: { createEvaluation: true, modelID: this.modelID } });
  }
}
