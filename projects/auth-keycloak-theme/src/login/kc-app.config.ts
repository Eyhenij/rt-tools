import { provideHttpClient } from '@angular/common/http';
import {
    ApplicationConfig,
    inject,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
    signal,
    Type,
} from '@angular/core';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { provideRtIcons, provideRtKit, provideRtKitLabels, ThemeService } from '@rt-tools/ui-kit-v2';

import { KC_CONTEXT, KC_PAGE, TKcContext } from './kc-context';
import { KC_MESSAGES, TKcMessages } from './kc-i18n';
import { kitTranslatorFor } from './kc-kit-labels';

/**
 * The application of one theme page. Keycloak serves the build under the resources address of the
 * theme, so the kit icons are asked there and not at the root of the host.
 */
export function themeAppConfig(context: TKcContext, i18n: TKcMessages, page: Type<unknown>): ApplicationConfig {
    const languageTag: string = i18n.currentLanguage.languageTag;

    return {
        providers: [
            provideBrowserGlobalErrorListeners(),
            provideZonelessChangeDetection(),
            provideHttpClient(),
            provideRtUtils(),
            provideRtStorage(),
            provideRtKit({ global: { theme: 'auto' } }),
            provideRtIcons(`${context.url.resourcesPath}/dist/icons`),
            provideRtKitLabels({ translator: signal(kitTranslatorFor(languageTag)), locale: signal(languageTag) }),
            // The service puts the theme mark on the page root, and the system theme applies from
            // the first frame rather than when the switch is drawn.
            provideAppInitializer((): void => {
                inject(ThemeService);
            }),
            { provide: KC_CONTEXT, useValue: context },
            { provide: KC_MESSAGES, useValue: i18n },
            { provide: KC_PAGE, useValue: page },
        ],
    };
}
