import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

import { ISnackBar } from './snack-bar-config.interface';

@Component({
    standalone: true,
    selector: 'rtui-snack-bar',
    templateUrl: './snack-bar.component.html',
    styleUrls: ['./snack-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButton, MatIconButton, MatIcon],
})
export class SnackBarComponent {
    public readonly data: ISnackBar.Data = inject(MAT_SNACK_BAR_DATA);
    readonly #snackBarRef: MatSnackBarRef<SnackBarComponent> = inject(MatSnackBarRef<SnackBarComponent>);

    public dismiss(): void {
        this.#snackBarRef.dismissWithAction();
    }

    public close(): void {
        this.#snackBarRef.dismiss();
    }
}
