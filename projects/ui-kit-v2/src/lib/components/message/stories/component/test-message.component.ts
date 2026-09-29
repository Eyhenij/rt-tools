import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { RtMessageComponent } from '../../rt-message.component';
import { IRtTag } from '../../../tag/rt-tag.model';
import { IRtIcon } from '../../../icon/rt-icon.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-message',
    template: `
        <app-story-presets fill caption="Сообщение в обоих наборах">
            <ng-template>
                <rt-message [severity]="severity" [icon]="icon" [hideIcon]="hideIcon" [closable]="closable" />
            </ng-template>
        </app-story-presets>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMessageComponent,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtMessageComponent {
    public severity: IRtTag.Severity = 'info';
    public icon: IRtIcon.Name | null = null;
    public hideIcon: boolean = false;
    public closable: boolean = false;
}
