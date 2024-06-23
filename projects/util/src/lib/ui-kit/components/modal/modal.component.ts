import { NgClass, NgComponentOutlet, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { IModal } from '../../../interfaces';
import { SanitizePipe } from '../../../pipes';
import { checkIsMatchingValues } from '../../../validators';

@Component({
    standalone: true,
    selector: 'rtui-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgStyle,
        NgClass,
        NgComponentOutlet,
        ReactiveFormsModule,
        SanitizePipe,

        // material
        MatDialogTitle,
        MatDialogContent,
        MatInputModule,
        MatIcon,
        MatSelectModule,
        MatDialogActions,
        MatButtonModule,
    ],
})
export class ModalComponent<T> implements OnInit {
    public readonly data: IModal.Data<T> = inject(MAT_DIALOG_DATA);
    readonly #dialogRef: MatDialogRef<ModalComponent<T>> = inject(MatDialogRef<ModalComponent<T>>);

    public control: FormControl | undefined;
    public selectControl: FormControl | undefined;

    public onClose(button: IModal.Button<T>): void {
        this.#dialogRef.close({
            value: Boolean(this.data.select) && button.assignSelectedValue ? this.selectControl?.value : button.value,
            message: Boolean(this.control) ? this.control?.value : null,
        });
    }

    public ngOnInit(): void {
        if (Boolean(this.data.select)) {
            this.selectControl = new FormControl(null, Validators.required);
        }

        if (Boolean(this.data.textArea)) {
            this.control = new FormControl(this.data.textArea?.value);
        }

        if (Boolean(this.data.input)) {
            this.control = new FormControl(null, [Validators.required, checkIsMatchingValues(this.data.input!.sample)]);
        }
    }
}
