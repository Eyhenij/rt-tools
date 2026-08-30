import { ChangeDetectionStrategy, Component, Signal, computed, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { RtIconOutlinedDirective } from '@rt-tools/core';
import { IRtSnackBar } from './snack-bar-config.interface';

const BEM_BLOCK: string = 'rtui-snack-bar';

@Component({
    selector: 'rtui-snack-bar',
    host: {
        class: BEM_BLOCK,
        '[style.--rt-snack-bar-progress-duration]': 'progressDuration()',
    },
    templateUrl: './snack-bar.component.html',
    styleUrls: ['./snack-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButton, MatIconButton, MatIcon, ElemDirective, BlockDirective, RtIconOutlinedDirective],
})
export class RtuiSnackBarComponent {
    public readonly data: IRtSnackBar.Data = inject(MAT_SNACK_BAR_DATA);
    readonly #snackBarRef: MatSnackBarRef<RtuiSnackBarComponent> = inject(MatSnackBarRef<RtuiSnackBarComponent>);

    /** Сколько идёт полоса: то же время, что живёт само сообщение. */
    public readonly progressDuration: Signal<string> = computed(() => `${this.data.duration ?? 0}ms`);

    public dismiss(): void {
        this.#snackBarRef.dismissWithAction();
    }

    public close(): void {
        this.#snackBarRef.dismiss();
    }
}
