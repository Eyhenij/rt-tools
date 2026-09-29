import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { RtAsideSectionComponent } from '../../rt-aside-section.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-aside-section',
    template: `
        <app-story-presets fill caption="Раздел панели в обоих наборах">
            <ng-template>
                <rt-aside-section [heading]="heading" />
            </ng-template>
        </app-story-presets>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAsideSectionComponent,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtAsideSectionComponent {
    public heading: string | null = 'Заголовок';
}
