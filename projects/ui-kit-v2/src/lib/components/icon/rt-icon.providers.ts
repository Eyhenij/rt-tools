import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { RT_ICONS_BASE_URL, RT_ICONS_MATERIAL_BASE_URL } from './rt-icon.registry';

/**
 * Называет адрес, по которому приложение опубликовало набор значков `rt-icon`.
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
 * Вперёд отсюда не грузится ничего: значок едет тогда, когда его попросила разметка, и платит
 * за него та страница, которая его нарисовала. Сборка спрайта и загрузка — дело `RtIconRegistry`.
 *
 * Сами файлы приложение публикует само — набор лежит в `assets/icons` пакета, и сборка копирует
 * его в свою статику.
 *
 * Наборов значков два: свой и материальный. Второй нужен только приложению, которое объявляет
 * материальный набор оформления, и адрес у него свой — набор лежит в `assets/icons-material`.
 *
 * @param baseUrl Адрес опубликованного набора. По умолчанию `/icons`.
 * @param materialBaseUrl Адрес материального набора. По умолчанию `/icons-material`.
 */
export function provideRtIcons(baseUrl?: string, materialBaseUrl?: string): EnvironmentProviders {
    return makeEnvironmentProviders([
        ...(baseUrl === undefined ? [] : [{ provide: RT_ICONS_BASE_URL, useValue: baseUrl }]),
        ...(materialBaseUrl === undefined ? [] : [{ provide: RT_ICONS_MATERIAL_BASE_URL, useValue: materialBaseUrl }]),
    ]);
}
