import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { IRtConfirmPopover } from '../../rt-confirm-popover.model';
import { RtConfirmDirective } from '../../rt-confirm.directive';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Директива висит на кнопке, а её входы пишутся под алиасами: без кнопки нажимать было нечего,
 * а без алиасов входы директивы не находились вовсе.
 */
@Component({
    selector: 'app-confirm',
    template: `
        <rt-icon-button
            icon="ico-trash"
            variant="danger"
            ariaLabel="Удалить запись"
            [rtConfirm]="message"
            [rtConfirmTitle]="title"
            [rtConfirmLabel]="label"
            [rtConfirmCancelLabel]="cancelLabel"
            [rtConfirmTone]="tone"
            [rtConfirmDisabled]="disabled" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtConfirmDirective,
        RtIconButtonComponent,
    ],
})
export class TestRtConfirmComponent {
    public message: string = 'Удалить запись? Действие необратимо.';
    public title: string | null = 'Удаление';
    public label: string = 'Удалить';
    public cancelLabel: string = 'Отмена';
    public tone: IRtConfirmPopover.Tone = 'danger';
    public disabled: boolean = false;
}
