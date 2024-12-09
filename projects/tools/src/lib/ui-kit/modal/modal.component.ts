import { NgClass, NgComponentOutlet, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { BlockDirective, ElemDirective } from '../../bem';
import { SanitizePipe } from '../../util/pipes/sanitize.pipe';
import { checkIsMatchingValues } from '../../util/validators/comparison.validator';
import { IModal } from './modal.types';

@Component({
    selector: 'rtui-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'rtui-modal' },
    imports: [
        NgStyle,
        NgClass,
        NgComponentOutlet,
        ReactiveFormsModule,
        SanitizePipe,

        // material
        MatDialogModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIcon,

        // BEM
        BlockDirective,
        ElemDirective,
    ],
})
export class RtuiModalComponent<T> implements OnInit {
    public readonly data: IModal.Data<T> = inject(MAT_DIALOG_DATA);
    readonly #dialogRef: MatDialogRef<RtuiModalComponent<T>> = inject(MatDialogRef<RtuiModalComponent<T>>);

    public control: FormControl | undefined;
    public selectControl: FormControl | undefined;

    public readonly bemBlock: string = 'rtui-modal';

    @HostBinding('class')
    public get hostClasses(): Record<string, boolean> {
        return {
            [this.bemBlock]: true,
        };
    }

    public ngOnInit(): void {
        if (Boolean(this.data.select)) {
            this.selectControl = new FormControl(null, Validators.required);
        }

        if (Boolean(this.data.textArea)) {
            this.control = new FormControl(this.data.textArea?.value);
        }

        if (Boolean(this.data.input)) {
            this.control = new FormControl(this.data.input?.value, Validators.required);

            if (this.data.input?.sample) {
                this.control.addValidators(checkIsMatchingValues(this.data.input.sample));
            }
        }
    }

    public onClose(button: IModal.Button<T>): void {
        this.#dialogRef.close({
            value: Boolean(this.data.select) && button.assignSelectedValue ? this.selectControl?.value : button.value,
            message: Boolean(this.control) ? this.control?.value : null,
        });
    }
}
