import { provideHttpClient } from '@angular/common/http';
import {
    ApplicationConfig,
    inject,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { provideRtIcons, ThemeService } from '@rt-tools/ui-kit-v2';

/**
 * Настройка страницы переписок.
 *
 * Маршрутов у страницы нет: она одна и открывается рамкой. Перехватчика кончившегося входа тоже —
 * вход здесь не сеанс человека, а признак страницы, и его конец разбирает сама страница.
 *
 * Значки кита публикует сборка по адресу `/icons` — тем же приёмом, что и админка: вперёд кит
 * ничего не грузит, значок едет тогда, когда его попросила разметка.
 *
 * Базы браузера страница не просит: выбор столбцов ей негде хранить, а признак страницы живёт в
 * памяти вкладки — закрытая вкладка кончает вход, так сказано описанием.
 */
export const talksConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideRtUtils(),
        provideRtStorage(),
        provideRtIcons('/icons'),
        provideAppInitializer((): void => {
            inject(ThemeService);
        }),
    ],
};
