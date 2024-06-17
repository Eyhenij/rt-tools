import { NgClass, NgComponentOutlet, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { SanitizePipe } from '../../../pipes';
import { checkIsMatchingValues } from '../../../validators';
import { ModalButton, ModalData } from '../../../interfaces';

@Component({
    standalone: true,
    selector: 'cc-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
    host: { class: 'matx-theme' },
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
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent<T> implements OnInit {
    public readonly data: ModalData<T> = inject(MAT_DIALOG_DATA);
    readonly #dialogRef: MatDialogRef<ModalComponent<T>> = inject(MatDialogRef<ModalComponent<T>>);

    public control: FormControl | undefined;
    public selectControl: FormControl | undefined;

    public onClose(button: ModalButton<T>): void {
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
            this.control = new FormControl(null, [Validators.required, checkIsMatchingValues(this.data.input?.sample!)]);
        }
    }
}
