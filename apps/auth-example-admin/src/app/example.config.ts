import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
    ApplicationConfig,
    inject,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideRtAuth, rtAuthInterceptor } from '@rt-tools/auth-angular';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { provideRtIcons, ThemeService } from '@rt-tools/ui-kit-v2';

import { EXAMPLE_ROUTES } from './example.routes';

/**
 * The configuration of the example admin.
 *
 * The admin enters the realm of the local stand as its own client. The token goes only with the
 * requests to `/api`: the example server behind the proxy. A token near its end is refreshed by the
 * interceptor before the request, so a person who keeps working is not sent back to the entry.
 */
export const EXAMPLE_CONFIG: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(EXAMPLE_ROUTES),
        provideRtAuth({ url: 'http://localhost:58080', realm: 'rt', clientId: 'rt-example-admin', tokenRecipients: ['/api'] }),
        provideHttpClient(withInterceptors([rtAuthInterceptor])),
        provideRtUtils(),
        provideRtStorage(),
        provideRtIcons('/icons'),
        provideAppInitializer((): void => {
            inject(ThemeService);
        }),
    ],
};
