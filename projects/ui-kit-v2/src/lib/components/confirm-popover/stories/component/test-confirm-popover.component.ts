import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { RtConfirmPopoverComponent } from '../../rt-confirm-popover.component';
import { IRtConfirmPopover } from '../../rt-confirm-popover.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-confirm-popover',
    template: `
        <app-story-presets caption="Подтверждение в обоих наборах">
            <ng-template>
                <rt-confirm-popover
                    [message]="message"
                    [title]="title"
                    [confirmLabel]="confirmLabel"
                    [cancelLabel]="cancelLabel"
                    [tone]="tone" />
            </ng-template>
        </app-story-presets>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtConfirmPopoverComponent,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtConfirmPopoverComponent {
    public message: string = 'Сообщение';
    public title: string | null = 'Заголовок';
    public confirmLabel: string = 'Подтвердить';
    public cancelLabel: string = 'Отмена';
    public tone: IRtConfirmPopover.Tone = 'danger';
}
