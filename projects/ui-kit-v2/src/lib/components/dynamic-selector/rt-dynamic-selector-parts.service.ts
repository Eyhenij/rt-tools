import { Injectable } from '@angular/core';

import { IRtDynamicSelectorParts } from './rt-dynamic-selector-parts.model';

/**
 * Состояние частей семьи динамических селекторов. Корень предоставляет его и привязывает свои
 * сигналы и обработчики в конструкторе, а окно выбора и список читают их отсюда вместо входов:
 * новая настройка правится в корне и в части, без проброса через разметку.
 */
@Injectable()
export class RtDynamicSelectorPartsService<T> {
    #popup: IRtDynamicSelectorParts.PopupSource<T> | null = null;
    #list: IRtDynamicSelectorParts.ListSource<T> | null = null;

    /** Корень привязал источник окна; без него окно берёт свои входы. */
    public get hasPopup(): boolean {
        return this.#popup !== null;
    }

    /** Источник окна выбора; часть вне корня падает с названием своего места. */
    public get popup(): IRtDynamicSelectorParts.PopupSource<T> {
        if (this.#popup === null) {
            throw new Error('rt-dynamic-selector-popup стоит вне корня: источник окна не привязан');
        }
        return this.#popup;
    }

    /** Источник списка выбранного. */
    public get list(): IRtDynamicSelectorParts.ListSource<T> {
        if (this.#list === null) {
            throw new Error('rt-dynamic-selector-list стоит вне корня: источник списка не привязан');
        }
        return this.#list;
    }

    public bindPopup(source: IRtDynamicSelectorParts.PopupSource<T>): void {
        this.#popup = source;
    }

    public bindList(source: IRtDynamicSelectorParts.ListSource<T>): void {
        this.#list = source;
    }
}
