import { Component, OnInit, Input, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../../store';
import { IModel } from '../../store/model/model.reducer';
import { MODEL_ADD } from '../../store/model/model.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';

import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-create-model',
  templateUrl: './createModel.component.html',
  styleUrls: ['./createModel.component.css']
})
export class CreateModelComponent implements OnInit {
  routerLink: String;
  createModelForm: FormGroup;
  subs: Array<Subscription>; 
  
  constructor(public store: Store<IAppState>, private router: Router, 
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<CreateModelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {models$: Store<IModel[]>}) {

      this.createModelForm = fb.group({
        name: ""
      });
      // this.route
      //   .queryParams
      //   .subscribe(params => {
      //     if (params['routerLink']){
      //       console.log('routerLink:',params['routerLink']);
      //       this.routerLink = params['routerLink'];
      //     }
      //   });
  }

  ngOnInit() {

  }

  createModel(): void{
    console.log("createModel");
    this.store.dispatch({
      type: MODEL_ADD,
      payload: this.createModelForm.value
    });
    this.dialogRef.close();
    
    // this.router.navigate([this.routerLink], { queryParams: { createModel: true } });
  }
}
