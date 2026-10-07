import { Clipboard } from '@angular/cdk/clipboard';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    input,
    InputSignal,
    signal,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { rtAsideErrorCopyText } from './rt-aside-error-box.logic';

const BEM_BLOCK: string = 'rt-aside-error-box';

/** Сколько кнопка держит «скопировано» — секунда, как у первого кита. */
const CONFIRM_DELAY_MS: number = 1000;

/**
 * Блок ошибки запроса боковой панели: надпись и кнопка, которая кладёт в буфер обмена время и
 * ошибку. Перенос `rtui-aside-error-box` первого кита без Material.
 *
 * Обычно его рисует сама панель по входу `requestError`; отдельно он нужен приложению, которое
 * показывает ошибку в другом месте.
 */
@Component({
    selector: 'rt-aside-error-box',
    templateUrl: './rt-aside-error-box.component.html',
    styleUrl: './rt-aside-error-box.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RtButtonDirective, BlockDirective, ElemDirective],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAsideErrorBoxComponent {
    readonly #clipboard: Clipboard = inject(Clipboard);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    #confirmTimer: ReturnType<typeof setTimeout> | null = null;

    readonly #copyLabel: Signal<string> = rtKitLabel('asideCopyErrorInfo');
    readonly #copiedLabel: Signal<string> = rtKitLabel('uiCopied');

    protected readonly title: Signal<string> = rtKitLabel('asideRequestError');

    protected readonly copied: WritableSignal<boolean> = signal(false);

    protected readonly buttonLabel: Signal<string> = computed((): string => (this.copied() ? this.#copiedLabel() : this.#copyLabel()));

    protected readonly buttonIcon: Signal<string | null> = computed((): string | null => (this.copied() ? 'check' : null));

    /** Ошибка, пришедшая от неудавшегося запроса: уходит в копию как JSON. */
    public readonly error: InputSignal<unknown> = input.required<unknown>();

    constructor() {
        this.#destroyRef.onDestroy((): void => this.#clearTimer());
    }

    protected onCopy(): void {
        this.#clipboard.copy(rtAsideErrorCopyText(this.error(), new Date()));
        this.copied.set(true);

        this.#clearTimer();
        this.#confirmTimer = setTimeout((): void => this.copied.set(false), CONFIRM_DELAY_MS);
    }

    #clearTimer(): void {
        if (this.#confirmTimer !== null) {
            clearTimeout(this.#confirmTimer);
            this.#confirmTimer = null;
        }
    }
}
