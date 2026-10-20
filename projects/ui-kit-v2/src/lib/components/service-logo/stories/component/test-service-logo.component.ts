import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtServiceLogoComponent } from '../../rt-service-logo.component';
import { IRtServiceLogo } from '../../rt-service-logo.model';
import { PLACEHOLDER_ROWS } from './story-placeholder-marks';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-service-logo',
    templateUrl: './test-service-logo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtServiceLogoComponent,
    ],
})
export class TestRtServiceLogoComponent {
    public size: IRtServiceLogo.Size = 'md';
    public logos: readonly IRtServiceLogo.Item[] = PLACEHOLDER_ROWS[2];
}
