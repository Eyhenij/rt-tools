import { computed, EnvironmentProviders, inject, InjectionToken, makeEnvironmentProviders, Signal, signal } from '@angular/core';

import { CMS_LABELS_EN } from './cms-labels.en';
import { TCmsLabelKey, TCmsLabelMap, TCmsLabelParams, TCmsTranslator } from './cms-labels.model';

const PLACEHOLDER: RegExp = /\{\{\s*(\w+)\s*\}\}/g;

/**
 * Fills the parameters into a default label. A place without a parameter stays as it is: a blank
 * there would read as a finished phrase, while `{{name}}` is seen and fixed.
 */
export function interpolateCmsLabel(text: string, params: TCmsLabelParams | undefined): string {
    if (params === undefined) {
        return text;
    }
    return text.replace(PLACEHOLDER, (match: string, name: string): string => (Object.hasOwn(params, name) ? String(params[name]) : match));
}

const defaultTranslator: TCmsTranslator = (key: TCmsLabelKey, params?: TCmsLabelParams): string =>
    interpolateCmsLabel(CMS_LABELS_EN[key], params);

function isLabelKey(key: string): key is TCmsLabelKey {
    return Object.hasOwn(CMS_LABELS_EN, key);
}

/**
 * The function the package gets its labels by. The token is a signal: an application that changes
 * the language on the fly puts a new function into it, and everything read from it recomputes.
 */
export const CMS_TRANSLATOR: InjectionToken<Signal<TCmsTranslator>> = new InjectionToken<Signal<TCmsTranslator>>('CMS_TRANSLATOR', {
    providedIn: 'root',
    factory: (): Signal<TCmsTranslator> => signal<TCmsTranslator>(defaultTranslator).asReadonly(),
});

/** All labels at once. A label the translator did not give is taken in English. */
export const CMS_LABELS: InjectionToken<Signal<TCmsLabelMap>> = new InjectionToken<Signal<TCmsLabelMap>>('CMS_LABELS', {
    providedIn: 'root',
    factory: (): Signal<TCmsLabelMap> => {
        const translator: Signal<TCmsTranslator> = inject(CMS_TRANSLATOR);
        return computed((): TCmsLabelMap => {
            const translate: TCmsTranslator = translator();
            const map: Record<string, string> = {};
            Object.keys(CMS_LABELS_EN)
                .filter(isLabelKey)
                .forEach((key: TCmsLabelKey) => {
                    map[key] = translate(key) || CMS_LABELS_EN[key];
                });
            return { ...CMS_LABELS_EN, ...map };
        });
    },
});

/**
 * One label rather than the whole map: for a label with substitutions or one whose key is chosen on
 * the fly. Called in an injection context.
 */
export function cmsLabel(key: TCmsLabelKey | Signal<TCmsLabelKey>, params?: TCmsLabelParams | Signal<TCmsLabelParams>): Signal<string> {
    const translator: Signal<TCmsTranslator> = inject(CMS_TRANSLATOR);
    return computed((): string => {
        const resolvedKey: TCmsLabelKey = typeof key === 'function' ? key() : key;
        const resolved: TCmsLabelParams | undefined = typeof params === 'function' ? params() : params;
        return translator()(resolvedKey, resolved) || defaultTranslator(resolvedKey, resolved);
    });
}

/**
 * Gives the package the application's labels. Without it the package works on the English default.
 * The way of delivery — Transloco, `$localize`, an own dictionary — is the application's business.
 */
export function provideCmsLabels(translator: Signal<TCmsTranslator>): EnvironmentProviders {
    return makeEnvironmentProviders([{ provide: CMS_TRANSLATOR, useValue: translator }]);
}
