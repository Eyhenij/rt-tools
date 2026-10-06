import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import Keycloak from 'keycloak-js';

import { IRtAuthConfig, RT_AUTH_CONFIG } from './auth.config';
import { RtAuthService } from './auth.service';
import { RT_KEYCLOAK } from './keycloak';

/**
 * The entry through Keycloak in one call. The application starts once the silent check has
 * answered, so the routes see the session at the first navigation.
 *
 * The token reaches requests through `rtAuthInterceptor` in `withInterceptors` of the HTTP client.
 */
export function provideRtAuth(config: IRtAuthConfig): EnvironmentProviders {
    return makeEnvironmentProviders([
        { provide: RT_AUTH_CONFIG, useValue: config },
        {
            provide: RT_KEYCLOAK,
            useFactory: (): Keycloak => new Keycloak({ url: config.url, realm: config.realm, clientId: config.clientId }),
        },
        RtAuthService,
        provideAppInitializer((): Promise<void> => inject(RtAuthService).init()),
    ]);
}
