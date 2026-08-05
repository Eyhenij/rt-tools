import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtInfoItemComponent } from '../../rt-info-item.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-info-item',
    template: `
        <rt-info-item [label]="label" [loading]="loading" [grow]="grow" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtInfoItemComponent,
    ],
})
export class TestRtInfoItemComponent {
    public label: string = 'Сохранить';
    public loading: boolean = false;
    public grow: boolean = false;
}
