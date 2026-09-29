import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { RtHeaderComponent } from '../../rt-header.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-header',
    template: `
        <app-story-presets fill caption="Шапка в обоих наборах">
            <ng-template>
                <rt-header [canGoBack]="canGoBack" [showInvite]="showInvite" />
            </ng-template>
        </app-story-presets>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtHeaderComponent,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtHeaderComponent {
    public canGoBack: boolean = false;
    public showInvite: boolean = false;
}
