import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
    ApplicationConfig,
    inject,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { AdminTitleStrategy, provideAdminKitLabels } from '@rt/message-bus-admin/common/core/util';
import { provideRtAuth, rtAuthInterceptor } from '@rt-tools/auth-angular';
import { provideRtIDBStorage, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { provideRtIcons, ThemeService } from '@rt-tools/ui-kit-v2';

import { appRoutes } from './app.routes';

/** Где входить: ответ приёмника на `GET /api/auth/settings`. */
export interface IEntrySettings {
    readonly url: string;
    readonly realm: string;
    readonly clientId: string;
}

/**
 * Иконки кита лежат отдельными файлами и публикуются сборкой по адресу `/icons`. Вперёд кит не
 * грузит ничего: значок едет тогда, когда его попросила разметка, и платит за него та страница,
 * которая его нарисовала. Адрес называется здесь, а не берётся китом умолчанием: публикует их
 * сборка приложения, и знает о нём только она.
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
 * Вход идёт через Keycloak: адрес, область и клиент приходят от приёмника, и токен едет только
 * с обращениями к `/api`. Перехватчик модуля входа обновляет токен перед обращением, поэтому
 * человек, который продолжает работать, не отправляется на вход заново.
 *
 * Основание кита — признак среды, пороги ширины и оба хранилища — ставится здесь целиком.
 * Просят его сами компоненты кита: таблица держит выбор столбцов в базе браузера, а реестр
 * значков и тема спрашивают среду. Без этих провайдеров экран поднимается заголовком и
 * обрывается на первом же из них; сборка молчит — инжектор собирается в браузере.
 */
export function appConfig(entry: IEntrySettings): ApplicationConfig {
    return {
        providers: [
            provideBrowserGlobalErrorListeners(),
            provideZonelessChangeDetection(),
            provideRouter(appRoutes, withComponentInputBinding()),
            provideRtAuth({ ...entry, tokenRecipients: ['/api'] }),
            provideHttpClient(withInterceptors([rtAuthInterceptor])),
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
}
