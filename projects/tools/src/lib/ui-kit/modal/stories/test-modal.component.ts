import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { RtModalService } from '../modal.service';
import { IModal } from '../modal.types';

@Component({
    selector: 'app-test-modal',
    templateUrl: './test-modal.component.html',
    styleUrls: ['./test-modal.component.scss'],
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

    public onOpenInfo(): void {
        const data: IModal.Data<boolean> = {
            title: this.title,
            text: this.text,
            buttonsAlign: 'end',
            buttons: [
                {
                    text: 'Ok',
                    appearance: 'flat',
                    color: 'primary',
                    value: true,
                    validateSelect: true,
                },
            ],
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

    public onOpenWithInput(): void {
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
            icon: {
                value: this.icon,
                style: {
                    ['font-weight']: '500',
                    ['font-size']: '2rem',
                    ['color']: this.iconColor,
                },
            },
            input: { label: 'Type in name in the box bellow', value: 'Name', placeholder: '' },
        };
        this.#modalsService.with(data).onConfirm();
    }

    public onOpenWithConfirmedInput(): void {
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
            icon: {
                value: this.icon,
                style: {
                    ['font-weight']: '500',
                    ['font-size']: '2rem',
                    ['color']: this.iconColor,
                },
            },
            input: { label: 'To confirm, type in "Test" in the box bellow', value: '', placeholder: '', sample: 'Test' },
        };
        this.#modalsService.with(data).onConfirm();
    }
}
