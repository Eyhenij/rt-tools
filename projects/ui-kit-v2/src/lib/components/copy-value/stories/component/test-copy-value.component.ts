import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtCopyValueComponent } from '../../rt-copy-value.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-copy-value',
    templateUrl: './test-copy-value.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCopyValueComponent,
    ],
})
export class TestRtCopyValueComponent {
    public value: string = '8f3c2a91-4d7e';
    public label: string = 'Reference';
    public copyLabel: string = 'Copy reference';
}
