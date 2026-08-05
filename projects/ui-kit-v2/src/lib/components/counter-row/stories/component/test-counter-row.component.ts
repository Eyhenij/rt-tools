import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtCounterRowComponent } from '../../rt-counter-row.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-counter-row',
    template: `
        <rt-counter-row [label]="label" [hint]="hint" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCounterRowComponent,
    ],
})
export class TestRtCounterRowComponent {
    public label: string = 'Сохранить';
    public hint: string = 'Подсказка';
}
