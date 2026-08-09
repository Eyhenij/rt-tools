import { ChangeDetectionStrategy, Component, signal, Signal, WritableSignal } from '@angular/core';

import { LIST_SORT_ORDER_ENUM, ISortModel } from '@rt-tools/utils';

import { RtTableSortHeaderComponent } from '../../rt-table-sort-header.component';
import { IRtTable } from '../../../rt-table.model';
import { RtTableComponent } from '../../../rt-table.component';

/** Колонка, по которой заголовок в этом показе разрешает сортировать. */
const COLUMN: string = 'name';

/**
 * Двойник таблицы: заголовок сортировки спрашивает у неё текущую сортировку, перечень колонок и
 * переключение порядка, и без неё падает отказом `NG0201`.
 *
 * Настоящая таблица здесь не годится вовсе: она тянет за собой хранилище настроек, колонки и
 * строки, то есть показ таблицы, а не заголовка. Двойник отдаёт ровно те три вещи, которые
 * заголовок берёт, — и щелчок по нему в витрине переключает порядок так же, как в таблице.
 */
class StoryTable {
    public readonly sort: WritableSignal<ISortModel<string> | null> = signal<ISortModel<string> | null>(null);

    public readonly currentSort: Signal<ISortModel<string> | null> = this.sort.asReadonly();

    public readonly columnsConfig: Signal<ReadonlyArray<IRtTable.ColumnConfig>> = signal<ReadonlyArray<IRtTable.ColumnConfig>>([
        { key: COLUMN, label: 'Название', sortable: true },
    ]);

    public toggleSort(propertyName: string): void {
        const current: ISortModel<string> | null = this.sort();
        if (current === null || current.propertyName !== propertyName) {
            this.sort.set({ propertyName, sortDirection: LIST_SORT_ORDER_ENUM.ASC });
            return;
        }
        this.sort.set(
            current.sortDirection === LIST_SORT_ORDER_ENUM.ASC ? { propertyName, sortDirection: LIST_SORT_ORDER_ENUM.DESC } : null
        );
    }
}

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-table-sort-header',
    template: `
        <rt-table-sort-header [rtSortHeader]="rtSortHeader">Название</rt-table-sort-header>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTableSortHeaderComponent,
    ],
    providers: [{ provide: RtTableComponent, useClass: StoryTable }],
})
export class TestRtTableSortHeaderComponent {
    public rtSortHeader: string = COLUMN;
}
