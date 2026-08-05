import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtTimelineComponent } from '../../rt-timeline.component';
import { IRtTimeline } from '../../rt-timeline.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-timeline',
    template: `
        <rt-timeline [steps]="steps" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTimelineComponent,
    ],
})
export class TestRtTimelineComponent {
    public steps: readonly IRtTimeline.Step[] = [];
}
