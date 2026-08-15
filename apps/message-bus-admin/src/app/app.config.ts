import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideRtIcons } from '@rt-tools/ui-kit-v2';

import { appRoutes } from './app.routes';

/**
 * Иконки кита лежат отдельными файлами и публикуются сборкой по адресу `/icons` — реестр
 * забирает их одним проходом на подъёме и дальше рисует без запросов. Адрес называется здесь,
 * а не берётся китом умолчанием: публикует их сборка приложения, и знает о нём только она.
 */
export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(appRoutes, withComponentInputBinding()),
        provideHttpClient(withFetch()),
        provideRtIcons('/icons'),
    ],
};
