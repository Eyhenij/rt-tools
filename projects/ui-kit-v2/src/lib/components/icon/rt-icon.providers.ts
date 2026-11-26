import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { RT_ICON_GLYPH_STRATEGY } from './rt-icon-font.service';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { RT_ICON_SETS_CONFIG } from './rt-icon.registry';
import { IRtIconSet } from './rt-icon-sets';
import { IRtIconSetsConfig, rtIconSetsConfig } from './rt-icon-sets.logic';

function reported(config: IRtIconSetsConfig): IRtIconSetsConfig {
    for (const warning of config.warnings) {
        // eslint-disable-next-line no-console -- предупреждение разработчику приложения: другого канала у кита нет
        console.warn(`provideRtIcons: ${warning}.`);
    }

    return config;
}

/**
 * Объявляет наборы значков приложения.
 *
 * ```typescript
 * export function withCoreProviders(): EnvironmentProviders {
 *     return makeEnvironmentProviders([
 *         provideHttpClient(...),
 *         provideRtStorage(),
 *         provideRtIcons({ sets: [{ name: 'brand', url: '/icons-brand' }], default: 'brand' }),
 *     ]);
 * }
 * ```
 *
 * Вперёд отсюда не грузится ничего: значок едет тогда, когда его попросила разметка, и платит
 * за него та страница, которая его нарисовала. Сборка спрайта и загрузка — дело `RtIconRegistry`.
 *
 * Сами файлы приложение публикует само — наборы `kit` и `material` лежат в `assets/icons` и
 * `assets/icons-material` пакета, и сборка копирует их в свою статику.
 */
export function provideRtIcons(options: IRtIconsOptions = {}): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: RT_ICON_SETS_CONFIG,
            useFactory: (): IRtIconSetsConfig => reported(rtIconSetsConfig(options.sets, options.default)),
        },
        ...(options.glyphStrategy === undefined ? [] : [{ provide: RT_ICON_GLYPH_STRATEGY, useValue: options.glyphStrategy }]),
    ]);
}

/** Настройки значков приложения. */
export interface IRtIconsOptions {
    /**
     * Наборы приложения рядом со встроенными `kit` и `material`. Имена значков у всех наборов
     * одни. Запись с именем встроенного набора меняет только названные поля. Набор без `fallback`
     * берёт недостающий рисунок из `kit`.
     */
    readonly sets?: ReadonlyArray<IRtIconSet>;
    /** Набор приложения. По умолчанию `kit`. */
    readonly default?: string;
    /**
     * Как значок рисует значение `glyph`: `map-first` (по умолчанию) — имя кита рисунком, любое
     * другое шрифтом Material Symbols; `font` — шрифт. Шрифт приложение подключает само.
     */
    readonly glyphStrategy?: IRtIcon.GlyphStrategy;
}
