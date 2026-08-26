import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { RT_ICONS_BASE_URL } from './rt-icon.registry';

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
 * @param baseUrl Адрес опубликованного набора. По умолчанию `/icons`.
 */
export function provideRtIcons(baseUrl?: string): EnvironmentProviders {
    return makeEnvironmentProviders(baseUrl === undefined ? [] : [{ provide: RT_ICONS_BASE_URL, useValue: baseUrl }]);
}
