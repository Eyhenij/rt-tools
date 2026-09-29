import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { RtCardComponent } from '../../rt-card.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-card',
    template: `
        <app-story-presets fill caption="Карточка в обоих наборах">
            <ng-template>
                <rt-card [header]="header" [ariaLabel]="ariaLabel" [clickable]="clickable" />
            </ng-template>
        </app-story-presets>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCardComponent,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtCardComponent {
    public header: string | null = null;
    public ariaLabel: string | null = null;
    public clickable: boolean = false;
}
