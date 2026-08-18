import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
    ApplicationConfig,
    inject,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { sessionExpiredInterceptor } from '@rt/message-bus-admin/auth/shell';
import { AdminTitleStrategy, provideAdminKitLabels } from '@rt/message-bus-admin/common/core/util';
import { provideRtIDBStorage, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { provideRtIcons, ThemeService } from '@rt-tools/ui-kit-v2';

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
 * Служба темы поднимается на старте, а не первым переключателем: выбор живёт на устройстве, а
 * применяет его эффект службы — пока её никто не спросил, страница после перезагрузки стоит
 * светлой, хотя выбрана тёмная. Единственный переключатель админки лежит в попапе профиля, то
 * есть до первого его открытия спрашивать службу некому.
 *
 * Заголовок вкладки собирает своя стратегия: раздел объявляет своё название маршрутом, а имя
 * приложения дописывается к нему здесь — вкладок у человека десяток, и по одному названию раздела
 * не видно, чьё оно.
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
        provideHttpClient(withInterceptors([sessionExpiredInterceptor])),
        provideRtUtils(),
        provideRtStorage(),
        provideRtIDBStorage(),
        provideRtIcons('/icons'),
        provideAdminKitLabels(),
        provideAppInitializer((): void => {
            inject(ThemeService);
        }),
        { provide: TitleStrategy, useClass: AdminTitleStrategy },
    ],
};
