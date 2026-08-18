import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, Signal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
import { EListSortOrder, TListSortOrderType } from '@rt-tools/utils';

import { RtIconComponent } from '../../icon/rt-icon.component';
import { IRtIcon } from '../../icon/rt-icon.model';
import { ariaSortOf, TRtTableAriaSort, isColumnSortable, sortDirectionOf } from '../rt-table-sort.logic';
import { RtTableComponent } from '../rt-table.component';

const BEM_BLOCK: string = 'rt-table-sort-header';

/** Иконка направления: без сортировки — обе стрелки, иначе стрелка выбранного порядка. */
const ICONS: Readonly<Record<TListSortOrderType | 'none', IRtIcon.Name>> = Object.freeze({
    none: 'sort-alt',
    [EListSortOrder.ASC]: 'arrow-up',
    [EListSortOrder.DESC]: 'arrow-down',
});

/**
 * Заголовок сортируемой колонки — атрибутом на ячейке шапки:
 * `<th *cdkHeaderCellDef cdk-header-cell rtSortHeader="checkIn">Заезд</th>`.
 *
 * Подпись проецируется внутрь кнопки, и доступное имя кнопки берётся из неё — порядок
 * меняется не только мышью. Текущее направление читается с самой колонки через
 * `aria-sort`, а видно его по стрелке.
 *
 * Колонка сортируется, только когда помечена `sortable` в `[columnsConfig]` таблицы;
 * иначе заголовок остаётся обычной подписью. Элементная форма селектора нужна правилу
 * префиксов и в разметке не применяется: `aria-sort` принадлежит ячейке шапки.
 */
@Component({
    selector: 'rt-table-sort-header, th[rtSortHeader]',
    templateUrl: './rt-table-sort-header.component.html',
    styleUrl: './rt-table-sort-header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        NgTemplateOutlet,

        // rt-tools
        BlockDirective,
        ElemDirective,
        ModDirective,

        // components
        RtIconComponent,
    ],
    host: {
        class: BEM_BLOCK,
        '[attr.aria-sort]': 'ariaSort()',
    },
})
export class RtTableSortHeaderComponent {
    readonly #table: RtTableComponent<unknown> = inject<RtTableComponent<unknown>>(RtTableComponent);

    /** Направление сортировки по этой колонке; `null` — сортирует другая либо никакая. */
    protected readonly direction: Signal<TListSortOrderType | null> = computed((): TListSortOrderType | null =>
        sortDirectionOf(this.#table.currentSort(), this.rtSortHeader())
    );

    protected readonly icon: Signal<IRtIcon.Name> = computed((): IRtIcon.Name => ICONS[this.direction() ?? 'none']);

    protected readonly sortable: Signal<boolean> = computed((): boolean =>
        isColumnSortable(this.#table.columnsConfig(), this.rtSortHeader())
    );

    /** Ключ колонки — тот же, что в `cdkColumnDef` и в `[columnsConfig]`. */
    public readonly rtSortHeader: InputSignal<string> = input.required<string>();

    public readonly ariaSort: Signal<TRtTableAriaSort> = computed((): TRtTableAriaSort =>
        ariaSortOf(this.#table.currentSort(), this.rtSortHeader())
    );

    protected onToggle(): void {
        this.#table.toggleSort(this.rtSortHeader());
    }
}
