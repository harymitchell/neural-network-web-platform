import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../store/index';
import { Observable } from 'rxjs/Observable';
import { USER_GET } from '../store/profile/profile.actions';

@Component({ 
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  profile$: Observable<{}>;

  constructor(private store: Store<IAppState>) {

    this.profile$ = store.select('profile');
  }

  ngOnInit(){
    this.store.dispatch({
      type: USER_GET
    });
  }
}
