import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtLiveBadgeComponent } from '../../rt-live-badge.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-live-badge',
    template: `
        <rt-live-badge [label]="label" [count]="count" [active]="active" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtLiveBadgeComponent,
    ],
})
export class TestRtLiveBadgeComponent {
    public label: string = 'Сохранить';
    public count: number | null = null;
    public active: boolean = false;
}
