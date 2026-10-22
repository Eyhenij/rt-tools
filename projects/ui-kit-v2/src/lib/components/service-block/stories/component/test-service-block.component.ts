import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IRtServiceLogo } from '../../../service-logo/rt-service-logo.model';
import { PLACEHOLDER_ROWS } from '../../../service-logo/stories/component/story-placeholder-marks';
import { RtServiceBlockComponent } from '../../rt-service-block.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-service-block',
    templateUrl: './test-service-block.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtServiceBlockComponent,
    ],
})
export class TestRtServiceBlockComponent {
    public logos: readonly IRtServiceLogo.Item[] = PLACEHOLDER_ROWS[0];
    public name: string = 'Платёжная служба';
    public description: string = 'Приём оплаты тарифов картой';
}
