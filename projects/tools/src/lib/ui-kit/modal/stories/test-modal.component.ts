import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { RtModalService } from '../modal.service';
import { IModal } from '../modal.types';

@Component({
    standalone: true,
    selector: 'app-open-modal-button',
    template: '<button mat-flat-button type="button" (click)="onClick()">Open Modal</button>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatButton, MatIcon],
    providers: [RtModalService],
})
export class TestModalComponent {
    readonly #modalsService: RtModalService = inject(RtModalService);

    @Input() public icon: string = 'info';
    @Input() public iconColor: string = 'blue';
    @Input() public title: string = 'Content example';
    @Input() public text: string = 'Title example';

    public onClick(): void {
        const data: IModal.Data<boolean> = {
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
                    validateSelect: true,
                },
            ],
            input: { label: 'To confirm, type in "Test" in the box bellow', placeholder: '', sample: 'Test' },
            icon: {
                value: this.icon,
                style: {
                    ['font-weight']: '500',
                    ['font-size']: '2rem',
                    ['color']: this.iconColor,
                },
            },
        };
        this.#modalsService.with(data).onConfirm();
    }
}
