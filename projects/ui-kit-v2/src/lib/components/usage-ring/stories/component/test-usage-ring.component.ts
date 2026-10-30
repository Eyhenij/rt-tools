import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { RtUsageRingComponent } from '../../rt-usage-ring.component';

/** Какой показ рисовать: площадку с контролами или пару наборов. */
export type TUsageRingStoryPart = 'playground' | 'presets';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-usage-ring',
    templateUrl: './test-usage-ring.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtUsageRingComponent,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtUsageRingComponent {
    public part: TUsageRingStoryPart = 'playground';
    public value: number = 32;
    public warnAt: number = 80;
    public hint: string = '32% of the monthly limit · Resets on 1 November';
}
