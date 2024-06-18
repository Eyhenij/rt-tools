import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { ModalService } from '../../components';
import { ModalData } from '../../../interfaces';

@Component({
    standalone: true,
    selector: 'open-modal-button',
    template: `<button mat-flat-button type="button" (click)="onClick()">Open Modal</button>`,
    styleUrls: ['./open-modal-button.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatButton, MatIcon],
    providers: [ModalService],
})
export class OpenModalButtonComponent {
    readonly #modalsService: ModalService = inject(ModalService);

    @Input() icon: string = 'info';
    @Input() iconColor: string = 'blue';
    @Input() title: string = 'Content example';
    @Input() text: string = 'Title example';

    public onClick(): void {
        const data: ModalData<boolean> = {
            title: this.title,
            text: this.text,
            buttonsAlign: 'end',
            buttons: [
                { text: 'No', value: null },
                {
                    text: 'Yes',
                    appearance: 'flat',
                    color: 'primary',
                    value: true,
                },
            ],
            icon: {
                value: this.icon,
                style: {
                    ['font-weight']: '500',
                    ['font-size']: '2rem',
                    ['color']: this.iconColor,
                },
            }
        };
        this.#modalsService.with(data).onConfirm();
    };
}
