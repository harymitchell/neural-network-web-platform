import { Injectable } from '@angular/core';  
import {Observable} from "rxjs";  
import {Store} from "@ngrx/store";

import { Subscription } from 'rxjs/Subscription';
import { IAppState } from '../../store/index';
import { IProfile } from '../../store/profile/profile.reducer';


@Injectable()
export class AutoLogoutService {
    profile$: Observable<IProfile>;
    profileStore$:  Store<IProfile>;
  

    constructor(
        store: Store<IAppState>
    ) { 
        // this.profileStore$ = store.select('profile');
        // this.profileStore$.map((profile) => profile);
        // this.profileStore$
        //     // .filter((x: IProfile) => x.loggedIn)
        //     .map((x: IProfile) => Observable.timer(5000))
        //     .do((x: any) => console.log("Activity detected! Timer has reset to 5 seconds"))
        //     .switch()
        //     .subscribe((x) => {
        //         console.log("Inactivity interval expired! Dispatching timeout event")
        //         store.dispatch({type: ACTIVITY_TIMEOUT_OCCURRED});
        //     });

    }

}