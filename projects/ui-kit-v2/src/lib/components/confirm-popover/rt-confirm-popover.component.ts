import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { rtKitLabel } from '../../i18n';
import { RtButtonDirective } from '../button/rt-button.directive';
import { IRtConfirmPopover } from './rt-confirm-popover.model';

const BEM_BLOCK: string = 'rt-confirm-popover';

/**
 * Презентационная панель подтверждения. Рендерится директивой `[rtConfirm]`
 * через CDK `ComponentPortal` под host-кнопкой. Содержит опциональный заголовок,
 * текст вопроса и две кнопки: «Отмена» (text/secondary) и подтверждающую
 * (`tone` — danger по умолчанию для деструктивных действий).
 *
 * `ViewEncapsulation.None` — стили префиксованы `.rt-confirm-popover`. Inputs
 * выставляются директивой через `setInput`; outputs (`confirm`/`cancel`) она
 * слушает и транслирует в `(confirmed)` / закрытие.
 */
@Component({
    selector: 'rt-confirm-popover',
    templateUrl: './rt-confirm-popover.component.html',
    styleUrl: './rt-confirm-popover.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RtButtonDirective, BlockDirective, ElemDirective],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtConfirmPopoverComponent {
    readonly #t_uiConfirm: Signal<string> = rtKitLabel('uiConfirm');
    readonly #t_uiCancel: Signal<string> = rtKitLabel('uiCancel');

    protected readonly confirmText: Signal<string> = computed((): string => this.confirmLabel() || this.#t_uiConfirm());
    protected readonly cancelText: Signal<string> = computed((): string => this.cancelLabel() || this.#t_uiCancel());

    public readonly message: InputSignal<string> = input<string>('');

    public readonly title: InputSignal<string | null> = input<string | null>(null);

    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly confirmLabel: InputSignal<string> = input<string>('');

    public readonly cancelLabel: InputSignal<string> = input<string>('');

    public readonly tone: InputSignal<IRtConfirmPopover.Tone> = input<IRtConfirmPopover.Tone>('danger');

    public readonly accepted: OutputEmitterRef<void> = output<void>();

    public readonly cancelled: OutputEmitterRef<void> = output<void>();

    protected onConfirm(): void {
        this.accepted.emit();
    }

    protected onCancel(): void {
        this.cancelled.emit();
    }
}
