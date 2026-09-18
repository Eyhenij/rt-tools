/**
 * Подписи админки по ключу и выбранному языку.
 *
 * До этой службы словарь был один и русский: выбор языка менял только то, что рисует кит, и
 * человек, выбравший английский, видел смесь — кнопки кита по-английски, заголовки по-русски.
 *
 * Наборов два, и ключ у них один: разные ключи под один текст расходятся молча — набор переводят,
 * а экран берёт соседний ключ.
 *
 * Ненайденный ключ отдаётся признаком, а не пустотой: пустая строка читается как «подписи здесь
 * нет» и доживает до жалобы человека, а `«ключ»` виден на экране и чинится по имени.
 */
import { computed, inject, Injectable, Signal } from '@angular/core';
import { TRtKitLabelParams } from '@rt-tools/ui-kit-v2';

import { ADMIN_LABELS, fill, TAdminLabelKey } from './admin-labels';
import { ADMIN_LABELS_EN } from './admin-labels-en';
import { AdminLocaleService, EAdminLocale } from './admin-locale';

/**
 * Способ взять текст по ключу.
 *
 * Передаётся доводом в чистые функции разделов: каркаса они не знают и словарь у инжектора
 * спросить не могут, а текст им нужен. Зовущий их экран словарь знает — он и передаёт.
 */
export type TAdminText = (key: TAdminLabelKey, params?: TRtKitLabelParams) => string;

/** Подпись ненайденного ключа: имя ключа в кавычках — его видно на экране и в тесте. */
function missing(key: TAdminLabelKey): string {
    return `«${key}»`;
}

/** Словарь подписей админки. Язык берётся из выбора человека и меняется без перезагрузки. */
@Injectable({ providedIn: 'root' })
export class AdminTextService {
    readonly #locale: AdminLocaleService = inject(AdminLocaleService);

    /**
     * Набор выбранного языка. Сигнал, а не постоянная: язык меняется на ходу, и всё, что от
     * набора считано, пересчитывается само.
     */
    readonly #labels: Signal<Partial<Record<TAdminLabelKey, string>>> = computed((): Partial<Record<TAdminLabelKey, string>> =>
        this.#locale.current() === EAdminLocale.En ? ADMIN_LABELS_EN : ADMIN_LABELS
    );

    /** Подпись по ключу с подстановками. Ключа в наборе нет — приходит признак, а не пустота. */
    public text(key: TAdminLabelKey, params?: TRtKitLabelParams): string {
        const found: string | undefined = this.#labels()[key];

        return found === undefined ? missing(key) : fill(found, params);
    }
}
