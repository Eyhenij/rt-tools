import { Clipboard } from '@angular/cdk/clipboard';
import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    signal,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtKitLabelKey, rtKitLabel } from '../../../i18n';
import { RtIconButtonComponent } from '../../icon-button/rt-icon-button.component';
import { IRtIconButton } from '../../icon-button/rt-icon-button.model';
import { IRtIcon } from '../../icon/rt-icon.model';

const BEM_BLOCK: string = 'rt-copy-cell';

/** Значение для буфера: явная строка/число либо `null` (тогда берётся отображаемый текст). */
type ICopyValue = string | number | null;

/**
 * Ключи подписей действия в покое и после копирования (tooltip и aria-label).
 *
 * Здесь ключи, а не готовый текст: константа вычисляется при загрузке чанка,
 * когда язык страницы ещё не выбран, — переводит сам компонент.
 */
const COPY_KEY: RtKitLabelKey = 'uiCopy';
const COPIED_KEY: RtKitLabelKey = 'uiCopied';

/** Сколько держать состояние «скопировано» перед сбросом иконки/подписи. */
const RESET_DELAY_MS: number = 2000;

/**
 * Ячейка с копированием в буфер — переиспользуемый примитив для `cdkCellDef`
 * (и не только). rt-table projection-driven: контент ячейки пишет
 * потребитель, поэтому копирование оформлено отдельным cell-level компонентом,
 * а не флагом на конфиге колонки.
 *
 * Потребитель проецирует отображаемый контент через `<ng-content>`. Что уйдёт в
 * буфер:
 * - если задан `[value]` — ровно он (нужно когда копируемое отличается от
 *   отображаемого: для id-ячейки показываем `#123`, копируем `123`);
 * - если `[value]` не задан — берётся отображаемый текст (textContent
 *   проецируемого контента, схлопнутые пробелы) — «копировать как показано»,
 *   удобно для составных ячеек (`#7 — Имя`).
 *
 * По умолчанию кнопка скрыта и проявляется при наведении/фокусе (для плотных
 * таблиц). Вне таблиц (модалки, карточки) строки для hover нет — там
 * `revealOnHover="false"` держит кнопку всегда видимой. Палитра кнопки —
 * через `variant` (по умолчанию `ghost`). После клика на `RESET_DELAY_MS`
 * иконка меняется `copy`→`check`, подпись — на «Скопировано».
 */
@Component({
    selector: 'rt-copy-cell',
    templateUrl: './rt-copy-cell.component.html',
    styleUrls: ['./rt-copy-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconButtonComponent,
        BlockDirective,
        ElemDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-copy-cell--static]': '!revealOnHover()',
    },
})
export class RtCopyCellComponent {
    readonly #clipboard: Clipboard = inject(Clipboard);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);

    #resetTimer: ReturnType<typeof setTimeout> | null = null;

    readonly #copyLabel: Signal<string> = rtKitLabel(COPY_KEY);
    readonly #copiedLabel: Signal<string> = rtKitLabel(COPIED_KEY);

    protected readonly copied: WritableSignal<boolean> = signal(false);

    protected readonly iconName: Signal<IRtIcon.Name> = computed((): IRtIcon.Name => (this.copied() ? 'check' : 'copy'));

    protected readonly actionLabel: Signal<string> = computed((): string => (this.copied() ? this.#copiedLabel() : this.#copyLabel()));

    /**
     * Строка для буфера. Если не задана — копируется отображаемый текст
     * (textContent проецируемого контента). Число приводится к строке.
     */
    public readonly value: InputSignal<ICopyValue> = input<ICopyValue>(null);

    /** Палитра кнопки копирования. В таблицах — `ghost`; вне таблиц удобнее `secondary`. */
    public readonly variant: InputSignal<IRtIconButton.Variant> = input<IRtIconButton.Variant>('ghost');

    /**
     * Прятать кнопку до наведения/фокуса (поведение плотных таблиц). `false` —
     * кнопка всегда видима: нужно вне таблиц (модалки/карточки), где нет строки
     * для hover.
     */
    public readonly revealOnHover: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    constructor() {
        this.#destroyRef.onDestroy((): void => this.#clearTimer());
    }

    protected onCopy(event: MouseEvent): void {
        // Гасим всплытие, чтобы клик/Enter по кнопке не активировал кликабельную
        // строку (rtTableRow) и не дошёл до прочих row-level слушателей.
        event.stopPropagation();

        this.#clipboard.copy(this.#resolveText());
        this.copied.set(true);

        this.#clearTimer();
        this.#resetTimer = setTimeout((): void => this.copied.set(false), RESET_DELAY_MS);
    }

    /** Явный `value` приоритетнее; иначе — отображаемый текст со схлопнутыми пробелами. */
    #resolveText(): string {
        const explicit: ICopyValue = this.value();
        if (explicit !== null) {
            return String(explicit);
        }

        const content: Element | null = this.#host.nativeElement.querySelector(`.${BEM_BLOCK}__content`);
        return (content?.textContent ?? '').replace(/\s+/g, ' ').trim();
    }

    #clearTimer(): void {
        if (this.#resetTimer !== null) {
            clearTimeout(this.#resetTimer);
            this.#resetTimer = null;
        }
    }
}
