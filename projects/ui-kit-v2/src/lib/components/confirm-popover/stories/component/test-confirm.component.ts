import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtConfirmDirective } from '../../rt-confirm.directive';
import { IRtConfirmPopover } from '../../rt-confirm-popover.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-confirm',
    template: `
        <div
            rtConfirm
            [message]="message"
            [title]="title"
            [label]="label"
            [cancelLabel]="cancelLabel"
            [tone]="tone"
            [disabled]="disabled"></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtConfirmDirective,
    ],
})
export class TestRtConfirmComponent {
    public message: string = 'Сообщение';
    public title: string | null = 'Заголовок';
    public label: string = 'Сохранить';
    public cancelLabel: string = 'Отмена';
    public tone: IRtConfirmPopover.Tone = 'danger';
    public disabled: boolean = false;
}
