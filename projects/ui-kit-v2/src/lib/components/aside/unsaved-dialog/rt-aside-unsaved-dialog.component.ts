import { inject, ChangeDetectionStrategy, Component, Signal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, RtKitLabelMap } from '../../../i18n';
import { RtButtonDirective } from '../../button/rt-button.directive';
import { RtDialogRef } from '../../dialog/rt-dialog-ref';
import { RtDialogComponent } from '../../dialog/rt-dialog.component';
import { ERtAsideUnsavedOutcome } from './rt-aside-unsaved.logic';

const BEM_BLOCK: string = 'rt-aside-unsaved-dialog';

/**
 * Окно, которое видит пользователь, закрывая панель с несохранёнными правками. Три
 * исхода: закрыть без сохранения, закрыть с сохранением, остаться. Открывает его
 * общая основа асайда, поэтому наружу компонент не экспортируется.
 *
 * Отказ от правок подан красной кнопкой: это единственный исход, после которого
 * введённое не вернуть.
 */
@Component({
    selector: 'rt-aside-unsaved-dialog',
    templateUrl: './rt-aside-unsaved-dialog.component.html',
    styleUrl: './rt-aside-unsaved-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtButtonDirective,
        RtDialogComponent,
        BlockDirective,
        ElemDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAsideUnsavedDialogComponent {
    readonly #dialogRef: RtDialogRef<ERtAsideUnsavedOutcome> = inject(RtDialogRef);

    protected readonly t: Signal<RtKitLabelMap> = inject(RT_KIT_LABELS);

    protected onDiscard(): void {
        this.#dialogRef.close(ERtAsideUnsavedOutcome.Discard);
    }

    protected onSave(): void {
        this.#dialogRef.close(ERtAsideUnsavedOutcome.Save);
    }

    protected onStay(): void {
        this.#dialogRef.close(ERtAsideUnsavedOutcome.Stay);
    }
}
