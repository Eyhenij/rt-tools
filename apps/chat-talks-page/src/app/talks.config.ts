import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { provideHttpClient } from '@angular/common/http';
import {
    ApplicationConfig,
    inject,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
    signal,
} from '@angular/core';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { provideRtIcons, provideRtKitLabels, ThemeService, TRtKitTranslator } from '@rt-tools/ui-kit-v2';

import { talksKitTranslator } from './talks-words';

/**
 * Настройка страницы переписок.
 *
 * Маршрутов у страницы нет: она одна и открывается рамкой. Перехватчика кончившегося входа тоже —
 * вход здесь не сеанс человека, а признак страницы, и его конец разбирает сама страница.
 *
 * Значки кита публикует сборка по адресу `/icons` — тем же приёмом, что и админка: вперёд кит
 * ничего не грузит, значок едет тогда, когда его попросила разметка.
 *
 * Подписи набора приходят функцией-переводчиком страницы: без неё лента, поле ответа и поиск
 * списка встают английским умолчанием набора рядом с русскими словами страницы.
 *
 * Базы браузера страница не просит: выбор столбцов ей негде хранить, а признак страницы живёт в
 * памяти вкладки — закрытая вкладка кончает вход, так сказано описанием.
 */
/** Язык страницы. Один: восемь наборов описания — работа вместе со словарём набора. */
const TALKS_LOCALE: string = 'ru';

// Данные русского языка ставятся здесь: ими набор показывает минуту реплики. Без них она встаёт
// английским умолчанием — `9/23/26, 12:58 PM` рядом с русскими словами страницы
registerLocaleData(localeRu, TALKS_LOCALE);

export const talksConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideRtUtils(),
        provideRtStorage(),
        provideRtIcons('/icons'),
        provideRtKitLabels({ translator: signal<TRtKitTranslator>(talksKitTranslator), locale: signal<string>(TALKS_LOCALE) }),
        provideAppInitializer((): void => {
            inject(ThemeService);
        }),
    ],
};
