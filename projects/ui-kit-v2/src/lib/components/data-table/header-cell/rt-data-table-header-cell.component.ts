import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { BlockDirective, ConcatClassesPipe, ElemDirective, ModDirective } from '@rt-tools/core';
import { EListSortOrder, ISortModel, TNullable } from '@rt-tools/utils';

import { RtIconComponent } from '../../icon/rt-icon.component';
import { IRtIcon } from '../../icon/rt-icon.model';
import { RtTooltipDirective } from '../../tooltip/rt-tooltip.directive';
import { dataTableIconName } from '../rt-data-table-cell.logic';
import { IRtDataTableIconContext } from '../rt-data-table-icon.directive';
import { dataTableNextSortOrder, dataTableSortActive } from '../rt-data-table-sort.logic';
import { IRtDataTable } from '../rt-data-table.model';

const BEM_BLOCK: string = 'rt-data-table-header-cell';

/**
 * Ячейка шапки `rt-data-table` — шапка первого кита без Material.
 *
 * Нажатие на шапку сортируемой колонки просит порядок: по возрастанию, затем по убыванию, и так
 * по кругу — снятия порядка нет. Стрелки порядка видны при наведении и у колонки, по которой
 * порядок стоит. Значок шапки — набором кита по имени первого кита либо шаблоном приложения.
 */
@Component({
    selector: 'rt-data-table-header-cell',
    templateUrl: './rt-data-table-header-cell.component.html',
    styleUrl: './rt-data-table-header-cell.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // components
        RtIconComponent,

        // directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        NgTemplateOutlet,
        RtTooltipDirective,

        // pipes
        ConcatClassesPipe,
    ],
    host: {
        class: BEM_BLOCK,
        '[style.text-align]': 'headerModel().align',
        '(click)': 'onClick()',
    },
})
export class RtDataTableHeaderCellComponent<T = Record<string, unknown>> {
    protected readonly active: Signal<boolean> = computed(() => dataTableSortActive(this.sortModel(), this.currentSortModel()));

    protected readonly labelMods: Signal<Record<string, string>> = computed(() => ({ align: this.headerModel().align }));

    protected readonly arrowsMods: Signal<Record<string, boolean>> = computed(() => ({ active: this.active() }));

    protected readonly descMods: Signal<Record<string, boolean>> = computed(() => ({
        active: this.active() && this.currentSortModel()?.sortDirection?.toLowerCase() === EListSortOrder.DESC,
        first: true,
    }));

    protected readonly ascMods: Signal<Record<string, boolean>> = computed(() => ({
        active: this.active() && this.currentSortModel()?.sortDirection?.toLowerCase() === EListSortOrder.ASC,
        second: true,
    }));

    /** Значок шапки; его цвет и видимость, как в первом ките, ничего не меняют. */
    protected readonly icon: Signal<IRtDataTable.Icon | null> = computed(() => this.headerModel().icon ?? null);

    protected readonly kitIcon: Signal<IRtIcon.Name | null> = computed(() => {
        const icon: IRtDataTable.Icon | null = this.icon();

        return icon ? dataTableIconName(icon.glyph) : null;
    });

    protected readonly iconContext: Signal<IRtDataTableIconContext<T> | null> = computed(() => {
        const icon: IRtDataTable.Icon | null = this.icon();
        const column: IRtDataTable.Column<T> | null = this.column();

        return icon && column ? { column, $implicit: icon.glyph, row: null } : null;
    });

    public readonly headerModel: InputSignal<IRtDataTable.Header> = input.required<IRtDataTable.Header>();
    public readonly sortModel: InputSignal<TNullable<ISortModel<string>>> = input.required<TNullable<ISortModel<string>>>();
    public readonly currentSortModel: InputSignal<TNullable<ISortModel<string>>> = input.required<TNullable<ISortModel<string>>>();

    /** Колонка шапки — её получает шаблон значка приложения. */
    public readonly column: InputSignal<IRtDataTable.Column<T> | null> = input<IRtDataTable.Column<T> | null>(null);

    /** Шаблон значка приложения; когда он дан, перечень кита не спрашивается. */
    public readonly iconTemplate: InputSignal<TemplateRef<IRtDataTableIconContext<T>> | null> = input<TemplateRef<
        IRtDataTableIconContext<T>
    > | null>(null);

    public readonly sortChange: OutputEmitterRef<ISortModel<string>> = output<ISortModel<string>>();

    protected onClick(): void {
        const propertyName: TNullable<string> = this.sortModel()?.propertyName;

        if (propertyName) {
            this.sortChange.emit({ propertyName, sortDirection: dataTableNextSortOrder(this.currentSortModel()) });
        }
    }
}
