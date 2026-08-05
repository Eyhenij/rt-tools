import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtCardComponent } from '../../rt-card.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-card',
    template: `
        <rt-card [header]="header" [ariaLabel]="ariaLabel" [clickable]="clickable" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCardComponent,
    ],
})
export class TestRtCardComponent {
    public header: string | null = null;
    public ariaLabel: string | null = null;
    public clickable: boolean = false;
}
