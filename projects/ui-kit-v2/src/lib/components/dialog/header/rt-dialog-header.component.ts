import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    ViewEncapsulation,
} from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtIconButtonComponent } from '../../icon-button/rt-icon-button.component';
import { RtDialogRef } from '../rt-dialog-ref';

const BEM_BLOCK: string = 'rt-dialog-header';

/**
 * Заголовок модалки для композиции внутри `<rt-dialog>`.
 *
 * Если компонент рендерится внутри overlay-портала, открытого через `RtDialogService.open()`,
 * кнопка закрытия дёргает `inject(RtDialogRef).close()` автоматически. В legacy-режиме
 * (внутри inline `<rt-dialog [visible]>`) `RtDialogRef` не зарегистрирован — клик
 * по close-кнопке эмитит output `(closeAction)`, который должен повесить родитель.
 *
 * `ViewEncapsulation.None` — для единообразия с rt-dialog (стили префиксованы `.rt-dialog-header`).
 *
 * @example
 * \`\`\`html
 * <rt-dialog size="md">
 *   <rt-dialog-header title="Создание записи" />
 *   <div>...форма...</div>
 *   <rt-dialog-footer>
 *     <button rtButton (click)="cancel()">Отмена</button>
 *     <button rtButton theme="primary" (click)="save()">Сохранить</button>
 *   </rt-dialog-footer>
 * </rt-dialog>
 * \`\`\`
 */
@Component({
    selector: 'rt-dialog-header',
    templateUrl: './rt-dialog-header.component.html',
    styleUrl: './rt-dialog-header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconButtonComponent,
        BlockDirective,
        ElemDirective,
        TranslocoPipe,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtDialogHeaderComponent {
    readonly #dialogRef: RtDialogRef | null = inject(RtDialogRef, { optional: true });

    /** Текст заголовка — рендерится в `<h2>`. */
    public readonly title: InputSignal<string> = input.required<string>();

    /** Показывать кнопку закрытия в углу заголовка. Дефолт `true`. */
    public readonly closable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    protected onClose(): void {
        // Programmatic mode — закрываем через DialogRef.
        this.#dialogRef?.close();
    }
}
