import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { sessionExpiredInterceptor } from '@rt/message-bus-admin/auth/shell';
import { ADMIN_LOCALE, rtKitLabelsRu } from '@rt/message-bus-admin/common/core/util';
import { provideRtIcons, provideRtKitLabels, RtKitTranslator } from '@rt-tools/ui-kit-v2';

import { appRoutes } from './app.routes';

/**
 * Иконки кита лежат отдельными файлами и публикуются сборкой по адресу `/icons` — реестр
 * забирает их одним проходом на подъёме и дальше рисует без запросов. Адрес называется здесь,
 * а не берётся китом умолчанием: публикует их сборка приложения, и знает о нём только она.
 *
 * Подписи кита приходят функцией-переводчиком из словаря приложения. Без неё переключатель
 * страниц, пустое состояние и настройка столбцов встают английским умолчанием рядом с русскими
 * заголовками, и видно это только на собранном экране. Язык один, поэтому и переводчик, и
 * локаль — постоянные сигналы: следить здесь не за чем.
 *
 * Перехватчик кончившегося входа стоит на всех обращениях сразу: вход обрывается посреди
 * работы, и узнаёт об этом то обращение, которое в этот момент ушло, — а не гвард, который
 * отвечает на переход.
 */
export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(appRoutes, withComponentInputBinding()),
        provideHttpClient(withFetch(), withInterceptors([sessionExpiredInterceptor])),
        provideRtIcons('/icons'),
        provideRtKitLabels({ translator: signal<RtKitTranslator>(rtKitLabelsRu), locale: signal<string>(ADMIN_LOCALE) }),
    ],
};
