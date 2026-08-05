import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';

import { firstValueFrom } from 'rxjs';

import { PlatformService } from '@rt-tools/core';

import { RT_ICONS_BASE_URL, RtIconRegistry } from './rt-icon.registry';

/**
 * Регистрирует все SVG-иконки `rt-icon` в sprite-реестре при бутстрапе приложения.
 *
 * ```typescript
 * export function withCoreProviders(): EnvironmentProviders {
 *     return makeEnvironmentProviders([
 *         provideHttpClient(...),
 *         provideRtStorage(),
 *         provideRtIcons(),
 *     ]);
 * }
 * ```
 *
 * Внутри: forkJoin по всем именам из `rt-icon-names.ts`, склейка в `<svg><symbol>...`,
 * вставка в `<body>` первым элементом. Компонент `<rt-icon>` через `<use href="#rt-icon-NAME">`
 * рендерит иконку из inline-sprite без дополнительных HTTP-запросов.
 *
 * Сами файлы приложение публикует само — набор лежит в `assets/icons` пакета, и
 * сборка копирует его в свою статику.
 *
 * @param baseUrl Адрес опубликованного набора. По умолчанию `/icons`.
 */
export function provideRtIcons(baseUrl?: string): EnvironmentProviders {
    return makeEnvironmentProviders([
        ...(baseUrl === undefined ? [] : [{ provide: RT_ICONS_BASE_URL, useValue: baseUrl }]),
        provideAppInitializer((): void => {
            // На сервере (SSR/prerender) sprite не грузим: относительные HTTP-запросы
            // к assets там невозможны, иконки дорисуются после гидрации.
            if (!inject(PlatformService).isPlatformBrowser) {
                return;
            }
            const registry: RtIconRegistry = inject(RtIconRegistry);
            // Не блокируем bootstrap: sprite иконок грузится в фоне, приложение
            // стартует сразу. Иначе Angular ждёт forkJoin из сотен SVG-запросов
            // (первая загрузка +5с). rt-icon рендерит через <use> по мере готовности sprite.
            void firstValueFrom(registry.preloadAll());
        }),
    ]);
}
