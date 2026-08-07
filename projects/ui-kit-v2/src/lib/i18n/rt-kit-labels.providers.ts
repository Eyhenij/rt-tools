import { computed, EnvironmentProviders, inject, InjectionToken, makeEnvironmentProviders, Provider, Signal, signal } from '@angular/core';

import { RT_KIT_LABELS_EN } from './rt-kit-labels.en';
import { RtKitLabelKey, RtKitLabelMap, RtKitLabelParams, RtKitTranslator } from './rt-kit-labels.model';

/** Места вида `{{name}}` — их заполняет `interpolate`. */
const PLACEHOLDER: RegExp = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;

/**
 * Подставляет параметры в подпись.
 *
 * Нужна английскому умолчанию: приложение свои подстановки делает само —
 * функция-переводчик обязана вернуть готовую строку. Место, для которого
 * параметра не дали, остаётся как есть: пустота на его месте прочиталась бы как
 * законченная фраза, а `{{name}}` виден и чинится.
 */
function interpolate(text: string, params: RtKitLabelParams | undefined): string {
    if (params === undefined) {
        return text;
    }

    return text.replace(PLACEHOLDER, (match: string, name: string): string => {
        const value: string | number | undefined = params[name];

        return value === undefined ? match : String(value);
    });
}

/** Английское умолчание: кит без единой настройки рисует текст, а не пустоты. */
const DEFAULT_TRANSLATOR: RtKitTranslator = (key: RtKitLabelKey, params?: RtKitLabelParams): string =>
    interpolate(RT_KIT_LABELS_EN[key], params);

/**
 * Функция, которой кит получает подписи. Её отдаёт приложение —
 * `provideRtKitLabels()`.
 *
 * Токен объявлен **сигналом**, а не просто функцией: приложение, меняющее язык
 * на ходу, кладёт в него новую функцию, и всё, что от неё считано,
 * пересчитывается само.
 */
export const RT_KIT_TRANSLATOR: InjectionToken<Signal<RtKitTranslator>> = new InjectionToken<Signal<RtKitTranslator>>('RT_KIT_TRANSLATOR', {
    providedIn: 'root',
    factory: (): Signal<RtKitTranslator> => signal<RtKitTranslator>(DEFAULT_TRANSLATOR).asReadonly(),
});

/**
 * Активная локаль. Ею кит форматирует даты — больше ни для чего она ему не
 * нужна.
 *
 * Данные локали для `DatePipe` регистрирует приложение: без них пайп падает
 * `Missing locale data`, и кит за это не отвечает.
 */
export const RT_KIT_LOCALE: InjectionToken<Signal<string>> = new InjectionToken<Signal<string>>('RT_KIT_LOCALE', {
    providedIn: 'root',
    factory: (): Signal<string> => signal<string>('en').asReadonly(),
});

/**
 * Все подписи кита разом, ключ → готовая строка.
 *
 * Этим пользуются компоненты: `t().uiClose` вместо ключа по одному. Карта
 * строится один раз на приложение (`providedIn: 'root'`) и пересчитывается,
 * только когда приложение сменило функцию-переводчик.
 *
 * Подпись, которой переводчик не дал (вернул пустое или упал), берётся
 * английской: пустая `aria`-подпись означает кнопку без имени для скринридера.
 */
export const RT_KIT_LABELS: InjectionToken<Signal<RtKitLabelMap>> = new InjectionToken<Signal<RtKitLabelMap>>('RT_KIT_LABELS', {
    providedIn: 'root',
    factory: (): Signal<RtKitLabelMap> => {
        const translator: Signal<RtKitTranslator> = inject(RT_KIT_TRANSLATOR);

        return computed((): RtKitLabelMap => {
            const translate: RtKitTranslator = translator();
            const map: Record<string, string> = {};
            for (const key of Object.keys(RT_KIT_LABELS_EN)) {
                map[key] = translate(key as RtKitLabelKey) || RT_KIT_LABELS_EN[key as RtKitLabelKey];
            }

            return map as RtKitLabelMap;
        });
    },
});

/**
 * Одна подпись, а не вся карта.
 *
 * Карте не годятся две вещи: подпись с подстановками (параметры приходят из
 * состояния компонента) и подпись, ключ которой выбирается на ходу — кнопка
 * «свернуть ↔ развернуть», текст ошибки поля по сработавшему валидатору. Обе
 * берутся отсюда. Зовётся в поле класса, в инъекционном контексте.
 *
 * ```typescript
 * readonly #range: Signal<string> = rtKitLabel('uiRangeOf', this.#rangeParams);
 * readonly #expand: Signal<string> = rtKitLabel(computed(() => (this.expanded() ? 'chatCollapse' : 'chatExpand')));
 * ```
 *
 * @param key Ключ подписи — значением или сигналом, если он меняется. Пустой
 *   ключ даёт пустую строку: у поля без сработавшего валидатора подписи нет, и
 *   умолчание тут показало бы ошибку там, где её не случилось.
 * @param params Подстановки — значением или сигналом, если они меняются.
 */
export function rtKitLabel(
    key: RtKitLabelKey | '' | Signal<RtKitLabelKey | ''>,
    params?: RtKitLabelParams | Signal<RtKitLabelParams>
): Signal<string> {
    const translator: Signal<RtKitTranslator> = inject(RT_KIT_TRANSLATOR);

    return computed((): string => {
        const resolvedKey: RtKitLabelKey | '' = typeof key === 'function' ? key() : key;
        if (resolvedKey === '') {
            return '';
        }
        const resolved: RtKitLabelParams | undefined = typeof params === 'function' ? params() : params;

        return translator()(resolvedKey, resolved) || DEFAULT_TRANSLATOR(resolvedKey, resolved);
    });
}

/**
 * Отдаёт киту подписи приложения.
 *
 * Без него кит работает на английском умолчании — оно вшито и покрывает все
 * ключи, поэтому пустой кнопки на экране не бывает никогда.
 *
 * ```typescript
 * export const appConfig: ApplicationConfig = {
 *     providers: [
 *         provideRtKitLabels({
 *             translator: computed(() => (key, params) => transloco.translate(`rtKit.${key}`, params)),
 *             locale: toSignal(transloco.langChanges$, { initialValue: transloco.getActiveLang() }),
 *         }),
 *     ],
 * };
 * ```
 *
 * Способ доставки — дело приложения: Transloco, `$localize`, собственный
 * словарь. Кит знает только ключи и то, что на них отвечают строкой.
 *
 * @param source Функция-переводчик и активная локаль. Локаль необязательна —
 *   без неё кит форматирует даты по-английски.
 */
export function provideRtKitLabels(source: {
    readonly translator: Signal<RtKitTranslator>;
    readonly locale?: Signal<string>;
}): EnvironmentProviders {
    const providers: Provider[] = [{ provide: RT_KIT_TRANSLATOR, useValue: source.translator }];
    if (source.locale !== undefined) {
        providers.push({ provide: RT_KIT_LOCALE, useValue: source.locale });
    }

    return makeEnvironmentProviders(providers);
}
