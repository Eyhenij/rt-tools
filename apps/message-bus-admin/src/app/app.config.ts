import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { sessionExpiredInterceptor } from '@rt/message-bus-admin/auth/shell';
import { provideAdminKitLabels } from '@rt/message-bus-admin/common/core/util';
import { provideRtIDBStorage, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { provideRtIcons } from '@rt-tools/ui-kit-v2';

import { appRoutes } from './app.routes';

/**
 * Иконки кита лежат отдельными файлами и публикуются сборкой по адресу `/icons` — реестр
 * забирает их одним проходом на подъёме и дальше рисует без запросов. Адрес называется здесь,
 * а не берётся китом умолчанием: публикует их сборка приложения, и знает о нём только она.
 *
 * Подписи кита приходят функцией-переводчиком из словаря приложения. Без неё переключатель
 * страниц, пустое состояние и настройка столбцов встают английским умолчанием рядом с русскими
 * заголовками, и видно это только на собранном экране. Языка два, и выбирает между ними человек:
 * и переводчик, и локаль приезжают сигналами службы языка, поэтому смена языка в попапе профиля
 * или на экране входа перерисовывает подписи кита без перезагрузки.
 *
 * Перехватчик кончившегося входа стоит на всех обращениях сразу: вход обрывается посреди
 * работы, и узнаёт об этом то обращение, которое в этот момент ушло, — а не гвард, который
 * отвечает на переход.
 *
 * Основание кита — признак среды, пороги ширины и оба хранилища — ставится здесь целиком.
 * Просят его сами компоненты кита: таблица держит выбор столбцов в базе браузера, а реестр
 * значков и тема спрашивают среду. Без этих провайдеров экран поднимается заголовком и
 * обрывается на первом же из них; сборка молчит — инжектор собирается в браузере.
 */
export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(appRoutes, withComponentInputBinding()),
        provideHttpClient(withFetch(), withInterceptors([sessionExpiredInterceptor])),
        provideRtUtils(),
        provideRtStorage(),
        provideRtIDBStorage(),
        provideRtIcons('/icons'),
        provideAdminKitLabels(),
    ],
};
