/**
 * Текст отказа правки, идущий за выбором языка.
 *
 * Приёмник называет причину кодом, а слово по нему есть на обоих языках. Значит человек, сменивший
 * язык при открытой панели, должен прочитать свой отказ на новом языке, а не прежнюю строку рядом
 * с переведёнными подписями.
 *
 * Поэтому здесь держится код, а слово выводится из него на каждой отрисовке. Панель кита держит
 * показанное строкой — она вычисляется один раз, и переключение языка её не трогает, — так что
 * строка в её сигнале служит признаком «отказ был», а текст панель показывает отсюда.
 */
import { computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { IRefusal } from '@rt/message-bus-common';

import { TAdminLabelKey } from './admin-labels';
import { AdminTextService } from './admin-text.service';
import { spokenRefusalOf } from './spoken-fault';

/** Принятый отказ: код причины либо пусто, когда приёмник его не назвал. */
interface ITakenFault {
    readonly refusal: IRefusal | null;
}

/** Текст отказа для панели: что показать и чем принять отказ приёмника. */
export interface IAdminFaultText {
    /** Текст на выбранном языке. Читается на каждой отрисовке: язык меняется на ходу. */
    readonly text: Signal<string>;
    /** Принять отказ. Возвращённое кладёт в свой сигнал панель кита — по нему она и покажет строку. */
    readonly take: (error: unknown) => string;
}

/**
 * Приём отказа панелью. Зовётся при заведении поля компонента: `inject` живёт в его окружении.
 *
 * @param fallback ключ строки экрана — ею отвечает поломка службы, у которой кода нет. Панель,
 *     у которой он зависит от состояния, даёт вместо ключа вызов: он читается при показе
 */
export function adminFaultText(fallback: TAdminLabelKey | (() => TAdminLabelKey)): IAdminFaultText {
    const dictionary: AdminTextService = inject(AdminTextService);
    const taken: WritableSignal<ITakenFault | null> = signal<ITakenFault | null>(null);
    const keyOf: () => TAdminLabelKey = (): TAdminLabelKey => (typeof fallback === 'function' ? fallback() : fallback);

    const text: Signal<string> = computed((): string => {
        const one: ITakenFault | null = taken();

        return one?.refusal == null ? dictionary.text(keyOf()) : dictionary.text(one.refusal.code, one.refusal.params);
    });

    return {
        text,
        take: (error: unknown): string => {
            taken.set({ refusal: spokenRefusalOf(error) });

            return text();
        },
    };
}
