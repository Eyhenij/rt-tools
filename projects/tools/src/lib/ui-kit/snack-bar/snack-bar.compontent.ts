import { ChangeDetectionStrategy, Component, WritableSignal, afterNextRender, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

import { BlockDirective, ElemDirective } from '../../bem';
import { RtIconOutlinedDirective } from '../../util';
import { progressDecreaseAnimation, progressIncreaseAnimation } from '../anumation';
import { ISnackBar } from './snack-bar-config.interface';

@Component({
    standalone: true,
    selector: 'rtui-snack-bar',
    templateUrl: './snack-bar.component.html',
    styleUrls: ['./snack-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButton, MatIconButton, MatIcon, ElemDirective, BlockDirective, MatProgressBar, RtIconOutlinedDirective],
    animations: [progressIncreaseAnimation, progressDecreaseAnimation],
})
export class RtuiSnackBarComponent {
    public readonly data: ISnackBar.Data = inject(MAT_SNACK_BAR_DATA);
    readonly #snackBarRef: MatSnackBarRef<RtuiSnackBarComponent> = inject(MatSnackBarRef<RtuiSnackBarComponent>);

    public isInitAnimation: WritableSignal<boolean> = signal(false);

    constructor() {
        afterNextRender(() => {
            this.isInitAnimation.set(true);
        });
    }

    public dismiss(): void {
        this.#snackBarRef.dismissWithAction();
    }

    public close(): void {
        this.#snackBarRef.dismiss();
    }
}
