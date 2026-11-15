import { computed, Signal } from '@angular/core';

import { rtKitLabel } from '@rt-tools/ui-kit-v2/core';

export namespace IRtLoadError {
    /** Контекст своего шаблона ошибки: `$implicit` — текст ошибки, `retry` — повтор загрузки. */
    export interface Context {
        $implicit: string;
        retry: () => void;
    }

    /** Готовый вид ошибки загрузки для шаблона компонента. */
    export interface View {
        /** Ошибка есть: `error` не null. Пустая строка — ошибка без своего текста. */
        readonly shown: Signal<boolean>;
        /** Заголовок: текст ошибки, а без него подпись кита `uiLoadError`. */
        readonly title: Signal<string>;
        /** Подсказка: вход описания, а без него подпись кита `uiLoadErrorHint`. */
        readonly hint: Signal<string>;
        readonly context: Signal<Context>;
    }
}

/**
 * Вид ошибки загрузки по одному договору для всех компонентов кита: заголовок, подсказка и
 * контекст своего шаблона. Повтор только сообщает наружу — данные и их загрузка у потребителя.
 * Зовётся в поле класса: подписям кита нужен контекст внедрения. Входы передаются функциями —
 * поле с видом стоит выше публичных входов и создаётся раньше них.
 */
export function rtLoadErrorView(error: () => string | null, description: () => string, retry: () => void): IRtLoadError.View {
    const fallbackTitle: Signal<string> = rtKitLabel('uiLoadError');
    const fallbackHint: Signal<string> = rtKitLabel('uiLoadErrorHint');

    return {
        shown: computed((): boolean => error() !== null),
        title: computed((): string => error() || fallbackTitle()),
        hint: computed((): string => description() || fallbackHint()),
        context: computed((): IRtLoadError.Context => ({ $implicit: error() ?? '', retry })),
    };
}
