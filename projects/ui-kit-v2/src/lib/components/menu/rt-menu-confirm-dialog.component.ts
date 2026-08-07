import { inject, ChangeDetectionStrategy, Component, Signal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, RtKitLabelMap } from '../../i18n';
import { RtButtonDirective } from '../button/rt-button.directive';
import { RtDialogRef } from '../dialog/rt-dialog-ref';
import { RtDialogComponent } from '../dialog/rt-dialog.component';
import { RT_DIALOG_DATA } from '../dialog/rt-dialog.tokens';
import { IRtMenu } from './rt-menu.model';

const BEM_BLOCK: string = 'rt-menu-confirm-dialog';

/**
 * Confirm-модалка деструктивного пункта `rt-menu-item`. Открывается через
 * `RtDialogService` (центрированный overlay поверх меню), возвращает `true`
 * при подтверждении и `false`/`undefined` при отмене.
 *
 * Модалка (а не popover-под-пунктом) нужна потому, что панель `rt-menu` сама
 * живёт в CDK Overlay: вложенный popover-overlay конфликтовал бы с её
 * backdrop/закрытием. Внутренний компонент — не экспортируется из `components`, это
 * деталь реализации confirm-флоу пункта меню.
 */
@Component({
    selector: 'rt-menu-confirm-dialog',
    templateUrl: './rt-menu-confirm-dialog.component.html',
    styleUrl: './rt-menu-confirm-dialog.component.scss',
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
export class RtMenuConfirmDialogComponent {
    protected readonly t: Signal<RtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly data: IRtMenu.ConfirmData = inject(RT_DIALOG_DATA) as IRtMenu.ConfirmData;

    readonly #dialogRef: RtDialogRef<boolean> = inject(RtDialogRef);

    protected onConfirm(): void {
        this.#dialogRef.close(true);
    }

    protected onCancel(): void {
        this.#dialogRef.close(false);
    }
}
