import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtHeaderComponent } from '../../rt-header.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-header',
    template: `
        <rt-header [canGoBack]="canGoBack" [showInvite]="showInvite" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtHeaderComponent,
    ],
})
export class TestRtHeaderComponent {
    public canGoBack: boolean = false;
    public showInvite: boolean = false;
}
