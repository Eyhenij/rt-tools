import { Clipboard } from '@angular/cdk/clipboard';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    signal,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { IRtIcon, rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';

const BEM_BLOCK: string = 'rt-copy-value';

/** Сколько держать состояние «скопировано» перед сбросом иконки и подписи. */
const RESET_DELAY_MS: number = 2000;

/**
 * Значение, которое человек переносит в другое место: номер обращения, ключ, идентификатор.
 * Подпись слева, значение на подложке и кнопка копирования с подсказкой. После нажатия иконка
 * на две секунды меняется на галочку, подпись — на «Copied».
 */
@Component({
    selector: 'rt-copy-value',
    templateUrl: './rt-copy-value.component.html',
    styleUrl: './rt-copy-value.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        RtIconButtonComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtCopyValueComponent {
    readonly #clipboard: Clipboard = inject(Clipboard);

    #resetTimer: ReturnType<typeof setTimeout> | null = null;

    readonly #t_uiCopy: Signal<string> = rtKitLabel('uiCopy');
    readonly #t_uiCopied: Signal<string> = rtKitLabel('uiCopied');

    protected readonly copied: WritableSignal<boolean> = signal(false);

    protected readonly iconName: Signal<IRtIcon.Name> = computed((): IRtIcon.Name => (this.copied() ? 'check' : 'copy'));

    protected readonly actionLabel: Signal<string> = computed((): string =>
        this.copied() ? this.#t_uiCopied() : this.copyLabel() || this.#t_uiCopy()
    );

    /** Что уходит в буфер и что показано на подложке. */
    public readonly value: InputSignal<string> = input.required<string>();

    /** Подпись слева от значения; пусто — не рисуется. */
    public readonly label: InputSignal<string> = input<string>('');

    /** Подсказка и имя кнопки в покое; пусто — переведённое «Copy». */
    public readonly copyLabel: InputSignal<string> = input<string>('');

    /** Значение ушло в буфер. */
    public readonly copiedValue: OutputEmitterRef<string> = output<string>();

    constructor() {
        inject(DestroyRef).onDestroy((): void => this.#clearTimer());
    }

    protected onCopy(): void {
        const value: string = this.value();

        this.#clipboard.copy(value);
        this.copied.set(true);
        this.copiedValue.emit(value);

        this.#clearTimer();
        this.#resetTimer = setTimeout((): void => this.copied.set(false), RESET_DELAY_MS);
    }

    #clearTimer(): void {
        if (this.#resetTimer !== null) {
            clearTimeout(this.#resetTimer);
            this.#resetTimer = null;
        }
    }
}
