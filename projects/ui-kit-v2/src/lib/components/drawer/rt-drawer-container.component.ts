import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rt-drawer-container';

/**
 * Участок страницы с боковыми панелями: строка из содержимого и панелей `rt-drawer` у его краёв.
 *
 * Контейнер задаёт строку и обрезает всё, что выходит за его края: панель поверх содержимого
 * ложится внутри контейнера, а не над всей страницей. Высоту контейнеру даёт место, в которое его
 * поставили, — панель тянется на всю эту высоту.
 *
 * @example
 * ```html
 * <rt-drawer-container>
 *     <rt-drawer resizable [(opened)]="filtersOpen" [(width)]="filtersWidth">…</rt-drawer>
 *     <section>Отчёт</section>
 * </rt-drawer-container>
 * ```
 */
@Component({
    selector: 'rt-drawer-container',
    templateUrl: './rt-drawer-container.component.html',
    styleUrl: './rt-drawer-container.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [BlockDirective, ElemDirective],
    host: {
        class: BEM_BLOCK,
        'qa-dataid': 'drawer-container',
    },
})
export class RtDrawerContainerComponent {}
