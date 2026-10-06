import { LocationStrategy } from '@angular/common';
import { DOCUMENT, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { IRtAuthConfig, RT_AUTH_CONFIG } from './auth.config';
import { RtAuthService } from './auth.service';
import { TRtPermissionRequirement } from './requirement';

/** The full address of a route, with the base of the application, for the return from Keycloak. */
function absoluteUrl(routeUrl: string): string {
    const external: string = inject(LocationStrategy).prepareExternalUrl(routeUrl);
    return new URL(external, inject(DOCUMENT).baseURI).href;
}

/** A route that needs an entry: a person who is not signed in goes to Keycloak and comes back here. */
export const rtAuthGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
    const auth: RtAuthService = inject(RtAuthService);
    if (auth.authenticated()) {
        return true;
    }
    void auth.login(absoluteUrl(state.url));
    return false;
};

/**
 * A route that needs rights, all or any of them. A person who is not signed in goes to the entry;
 * one without the rights goes to the address for a refusal, or stays where they were.
 */
export function rtPermissionGuard(requirement: TRtPermissionRequirement): CanActivateFn {
    return (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree => {
        const auth: RtAuthService = inject(RtAuthService);
        const config: IRtAuthConfig = inject(RT_AUTH_CONFIG);
        let verdict: boolean | UrlTree = false;
        if (auth.authenticated()) {
            verdict =
                auth.meets(requirement) || (config.forbiddenPath === undefined ? false : inject(Router).parseUrl(config.forbiddenPath));
        } else {
            void auth.login(absoluteUrl(state.url));
        }
        return verdict;
    };
}
