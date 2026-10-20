import { DOCUMENT } from '@angular/common';
import { afterRenderEffect, inject } from '@angular/core';

/**
 * Держит подсвеченную клавишами опцию в видимой части панели.
 *
 * Панель списка ограничена по высоте, и длинный список прокручивается внутри неё. Клавиши двигают
 * подсветку, но фокус остаётся на поле: браузер сам панель не прокручивает, и подсветка уходила
 * за нижний край — человек выбирал Enter'ом то, чего не видел. После каждой отрисовки, в которой
 * сменилась подсвеченная опция, она прокручивается ровно настолько, чтобы встать в панель.
 *
 * Панель рисуется в наложении, вне поддерева семьи, поэтому опция ищется в документе по своему
 * идентификатору — тому же, что стоит в `aria-activedescendant`. На сервере отрисовки нет, и
 * эффект не выполняется; среда без `scrollIntoView` пропускается.
 *
 * Зовётся в контексте внедрения — полем или конструктором семьи.
 *
 * @param activeOptionId идентификатор подсвеченной опции; `null` — подсветки нет или панель закрыта
 */
export function rtScrollActiveOptionIntoView(activeOptionId: () => string | null): void {
    const document: Document = inject(DOCUMENT);

    afterRenderEffect((): void => {
        const id: string | null = activeOptionId();
        const option: HTMLElement | null = id ? document.getElementById(id) : null;

        if (typeof option?.scrollIntoView === 'function') {
            option.scrollIntoView({ block: 'nearest' });
        }
    });
}
