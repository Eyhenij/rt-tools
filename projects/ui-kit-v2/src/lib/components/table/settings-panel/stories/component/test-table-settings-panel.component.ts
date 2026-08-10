import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtTableSettingsPanelComponent } from '../../rt-table-settings-panel.component';
import { IRtTable } from '../../../rt-table.model';

/** Набор колонок таблицы договоров: закреплённая, обычные и одна скрытая. */
const ITEMS: ReadonlyArray<IRtTable.ColumnSettingItem> = [
    { key: 'title', label: 'Договор', locked: true, hidden: false },
    { key: 'city', label: 'Город', hidden: false },
    { key: 'sum', label: 'Сумма', hidden: false },
    { key: 'manager', label: 'Менеджер', hidden: true },
];

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Набор колонок задан здесь, а не значением истории: панель без колонок не рисует ни строки, и
 * такой показ покрытием не считается.
 */
@Component({
    selector: 'app-table-settings-panel',
    template: `
        <rt-table-settings-panel [items]="items" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTableSettingsPanelComponent,
    ],
})
export class TestRtTableSettingsPanelComponent {
    public items: ReadonlyArray<IRtTable.ColumnSettingItem> = ITEMS;
}
