import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtTableSettingsPanelComponent } from '../../rt-table-settings-panel.component';
import { IRtTable } from '../../../rt-table.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
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
    public items: ReadonlyArray<IRtTable.ColumnSettingItem> = [];
}
