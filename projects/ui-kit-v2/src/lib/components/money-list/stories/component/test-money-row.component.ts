import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtMoneyRowComponent } from '../../rt-money-row.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-money-row',
    template: `
        <rt-money-row [label]="label" [total]="total" [loading]="loading" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMoneyRowComponent,
    ],
})
export class TestRtMoneyRowComponent {
    public label: string = 'Сохранить';
    public total: boolean = false;
    public loading: boolean = false;
}
