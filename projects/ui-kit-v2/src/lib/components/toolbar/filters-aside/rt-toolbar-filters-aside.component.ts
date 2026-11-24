import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';

import { RT_ASIDE_DATA, RtAsideRef } from '@rt-tools/ui-kit-v2/aside';
import { RtToolbarFiltersPanelComponent } from '../filters-panel/rt-toolbar-filters-panel.component';
import { IRtToolbar } from '../rt-toolbar.model';

const BEM_BLOCK: string = 'rt-toolbar-filters-aside';

/**
 * Панель отборов полосы `rt-toolbar` на узком экране.
 *
 * Её поднимает кнопка фильтров полосы службой боковых панелей кита, когда панель открывает сама
 * полоса (`filtersPanel="kit"`). Содержимое — `rt-toolbar-filters-panel` с отборами полосы: шапка
 * «Фильтры» со стрелкой, слот `rtToolbarFilters` с контекстом `panel`, подвал «Сбросить» и
 * «Применить». «Сбросить» сообщает о себе и оставляет панель открытой, «Применить» сообщает и
 * закрывает, стрелка закрывает молча.
 */
@Component({
    selector: 'rt-toolbar-filters-aside',
    templateUrl: './rt-toolbar-filters-aside.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // components
        RtToolbarFiltersPanelComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class RtToolbarFiltersAsideComponent {
    readonly #asideRef: RtAsideRef = inject(RtAsideRef);

    protected readonly data: IRtToolbar.IFiltersPanelData = inject(RT_ASIDE_DATA) as IRtToolbar.IFiltersPanelData;

    protected close(): void {
        this.#asideRef.close();
    }
}
