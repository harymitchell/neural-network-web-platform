import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { IProfile } from '../store/profile/profile.reducer';
import { Store } from '@ngrx/store';
import { IAppState } from '../store/index';
import { ProfileEffects } from '../store/profile/profile.effects';
 
@Injectable()
export class AuthGuard implements CanActivate {
 
    profile$: Observable<IProfile>;
    profileStore$:  Store<IProfile>;

    constructor(private router: Router, private store: Store<IAppState>, private profileEffects: ProfileEffects) {
        this.profileStore$ = store.select('profile');
        this.profile$ = this.profileStore$.map((profile) => profile);
    }
 
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<boolean>|boolean {
        return this.profile$.map(profile => {
            if (profile) {
                // logged in so return true
                return true;
            }

            // not logged in so redirect to login page with the return url
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
            return false;
        });
    }
}