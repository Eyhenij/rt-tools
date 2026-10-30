import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Signal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RT_ASIDE_DATA, RtAsideComponent, RtAsideFooterComponent, RtAsideHeaderComponent, RtAsideRef } from '@rt-tools/ui-kit-v2/aside';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { IRtToolbar } from '../rt-toolbar.model';

const BEM_BLOCK: string = 'rt-toolbar-filters-aside';

/**
 * Панель отборов полосы `rt-toolbar` на узком экране.
 *
 * Её поднимает кнопка фильтров полосы службой боковых панелей кита. В теле — слот
 * `rtToolbarFilters` с контекстом `panel`; шапка — заголовок «Фильтры» и стрелка возврата, без
 * надзаголовка и действий; подвал — «Сбросить» и «Применить» по краям. «Сбросить» сообщает о себе
 * и оставляет панель открытой, «Применить» сообщает и закрывает, стрелка закрывает молча.
 */
@Component({
    selector: 'rt-toolbar-filters-aside',
    templateUrl: './rt-toolbar-filters-aside.component.html',
    styleUrl: './rt-toolbar-filters-aside.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        NgTemplateOutlet,

        // components
        RtAsideComponent,
        RtAsideFooterComponent,
        RtAsideHeaderComponent,

        // directives
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
    ],
    host: { class: BEM_BLOCK },
})
export class RtToolbarFiltersAsideComponent {
    readonly #asideRef: RtAsideRef = inject(RtAsideRef);

    protected readonly data: IRtToolbar.IFiltersPanelData = inject(RT_ASIDE_DATA) as IRtToolbar.IFiltersPanelData;

    protected readonly title: Signal<string> = rtKitLabel('uiFilters');
    protected readonly resetLabel: Signal<string> = rtKitLabel('uiReset');
    protected readonly applyLabel: Signal<string> = rtKitLabel('uiApply');

    protected onReset(): void {
        this.data.reset();
    }

    protected onApply(): void {
        this.data.apply();
        this.#asideRef.close();
    }
}
