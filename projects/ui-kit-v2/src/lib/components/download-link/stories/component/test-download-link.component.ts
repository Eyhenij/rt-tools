import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtDownloadLinkComponent } from '../../rt-download-link.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-download-link',
    template: `
        <rt-download-link [label]="label" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDownloadLinkComponent,
    ],
})
export class TestRtDownloadLinkComponent {
    public label: string = 'Сохранить';
}
