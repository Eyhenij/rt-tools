import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtDetailRowComponent } from '../../rt-detail-row.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-detail-row',
    template: `
        <rt-detail-row [label]="label" [loading]="loading" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDetailRowComponent,
    ],
})
export class TestRtDetailRowComponent {
    public label: string = 'Сохранить';
    public loading: boolean = false;
}
