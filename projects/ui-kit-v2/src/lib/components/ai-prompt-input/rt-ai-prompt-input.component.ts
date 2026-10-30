import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
    booleanAttribute,
    computed,
    inject,
    input,
    model,
    numberAttribute,
    output,
    signal,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    ModelSignal,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RT_KIT_LABELS, TRtKitLabelMap, rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtFileCardComponent } from '@rt-tools/ui-kit-v2/file-card';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtUsageRingComponent } from '@rt-tools/ui-kit-v2/usage-ring';

import { IRtAiPromptInput } from './rt-ai-prompt-input.model';

const BEM_BLOCK: string = 'rt-ai-prompt-input';

/** Можно ли отправить: есть непустой текст или файл, поле свободно. */
export function rtPromptCanSend(text: string, files: number, busy: boolean): boolean {
    return !busy && (text.trim().length > 0 || files > 0);
}

/**
 * Поле ввода ИИ-чата: одна рамка, текст сверху, ряд действий внутри рамки снизу.
 *
 * Слева в ряду «+» для файлов, справа модель, усилие, режим, кольцо расхода и отправка. Каждый
 * элемент ряда включается своим входом: без значения его нет. Что открывает нажатие на модель,
 * усилие и режим, решает приложение: поле сообщает, какую кнопку нажали.
 *
 * Свои элементы ряда приложение кладёт проекцией: с меткой `rtPromptInputStart` они встают слева
 * после «+», с меткой `rtPromptInputEnd` справа перед моделью и отправкой. Подходит любой
 * элемент высотой с кнопку sm: кнопка-иконка, кнопка с текстом, выпадающий список.
 *
 * @example
 * ```html
 * <rt-ai-prompt-input attachments>
 *     <rt-icon-button rtPromptInputStart icon="bolt" variant="ghost" size="sm" ariaLabel="Быстрые ответы" />
 *     <button rtButton rtPromptInputStart appearance="text" size="sm" label="Отправить позже"></button>
 *     <rt-icon-button rtPromptInputEnd icon="mic" variant="ghost" size="sm" ariaLabel="Голос" />
 * </rt-ai-prompt-input>
 * ```
 *
 * Подсказка стоит отдельной строкой под полем или над ним, в ряд действий она не входит.
 *
 * Отправка — `Enter` без Shift или кнопка со стрелкой; `Shift+Enter` переносит строку. Со
 * `stoppable` во время `sending` стрелку сменяет «Стоп», а поле остаётся открытым.
 */
@Component({
    selector: 'rt-ai-prompt-input',
    templateUrl: './rt-ai-prompt-input.component.html',
    styleUrl: './rt-ai-prompt-input.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // cdk
        CdkTextareaAutosize,

        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtButtonDirective,
        RtFileCardComponent,
        RtIconButtonComponent,
        RtUsageRingComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAiPromptInputComponent {
    readonly #t_placeholder: Signal<string> = rtKitLabel('chatPlaceholder');

    readonly #t_disclaimer: Signal<string> = rtKitLabel('aiDisclaimer');

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly fileInput: Signal<ElementRef<HTMLInputElement> | undefined> = viewChild<ElementRef<HTMLInputElement>>('fileEl');

    protected readonly textInput: Signal<ElementRef<HTMLTextAreaElement> | undefined> =
        viewChild<ElementRef<HTMLTextAreaElement>>('textEl');

    protected readonly files: WritableSignal<File[]> = signal<File[]>([]);

    protected readonly placeholderText: Signal<string> = computed((): string => this.placeholder() || this.#t_placeholder());

    /** Текст подсказки: `null` — английское умолчание кита, пустая строка — подсказки нет. */
    protected readonly hintText: Signal<string> = computed((): string => this.hint() ?? this.#t_disclaimer());

    protected readonly hintAbove: Signal<boolean> = computed((): boolean => this.hintText() !== '' && this.hintPosition() === 'above');

    protected readonly hintBelow: Signal<boolean> = computed((): boolean => this.hintText() !== '' && this.hintPosition() === 'below');

    /** Поле закрыто для набора: выключено или идёт ответ, который нельзя остановить. */
    protected readonly locked: Signal<boolean> = computed((): boolean => this.disabled() || (this.sending() && !this.stoppable()));

    protected readonly canSend: Signal<boolean> = computed((): boolean =>
        rtPromptCanSend(this.text(), this.attachments() ? this.files().length : 0, this.sending() || this.disabled())
    );

    /** Идёт ответ, который можно остановить: вместо стрелки стоит «Стоп». */
    protected readonly isStoppable: Signal<boolean> = computed((): boolean => this.stoppable() && this.sending() && !this.disabled());

    protected readonly hasUsage: Signal<boolean> = computed((): boolean => this.usage() !== null);

    protected readonly boxMods: Signal<Record<string, boolean>> = computed((): Record<string, boolean> => ({
        disabled: this.disabled(),
    }));

    /** Текст-подсказка поля. Пусто — переведённое умолчание кита. */
    public readonly placeholder: InputSignal<string> = input<string>('');

    /** Подсказка отдельной строкой. `null` — английское умолчание кита, пустая строка убирает её. */
    public readonly hint: InputSignal<string | null> = input<string | null>(null);

    /** Где стоит подсказка: под полем, а где места под ним нет — над полем. */
    public readonly hintPosition: InputSignal<IRtAiPromptInput.HintPosition> = input<IRtAiPromptInput.HintPosition>('below');

    /** Кнопка «+» и карточки приложенных файлов. */
    public readonly attachments: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Фильтр типов файлов (`.pdf,.png`). */
    public readonly accept: InputSignal<string> = input<string>('');

    /** Подпись модели. Пусто — кнопки модели нет. */
    public readonly model: InputSignal<string> = input<string>('');

    /** Подпись усилия. Пусто — кнопки усилия нет. */
    public readonly effort: InputSignal<string> = input<string>('');

    /** Подпись режима. Пусто — кнопки режима нет. */
    public readonly mode: InputSignal<string> = input<string>('');

    /** Потраченная доля лимита в процентах. `null` — кольца нет. */
    public readonly usage: InputSignal<number | null> = input<number | null>(null);

    /** Подсказка кольца по наведению: доля и дата сброса словами приложения. */
    public readonly usageHint: InputSignal<string> = input<string>('');

    /** С этой доли кольцо оранжевое. */
    public readonly usageWarnAt: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(80, {
        transform: numberAttribute,
    });

    /** Отправка идёт: кнопка крутит индикатор, без `stoppable` поле закрыто. */
    public readonly sending: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Ответ можно остановить: во время `sending` стрелку сменяет «Стоп», поле открыто. */
    public readonly stoppable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Наименьшая высота поля в строках. */
    public readonly minRows: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(1, { transform: numberAttribute });

    /** Наибольшая высота поля в строках, дальше текст прокручивается. */
    public readonly maxRows: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(8, { transform: numberAttribute });

    /** Черновик: задаётся снаружи, правки уходят наружу, после отправки пуст. */
    public readonly text: ModelSignal<string> = model<string>('');

    /** Отправка вопроса. */
    public readonly submitted: OutputEmitterRef<IRtAiPromptInput.SubmitPayload> = output<IRtAiPromptInput.SubmitPayload>();

    /** Нажата «Стоп» во время ответа. */
    public readonly stopped: OutputEmitterRef<void> = output<void>();

    /** Нажата кнопка модели, усилия или режима. */
    public readonly controlPicked: OutputEmitterRef<IRtAiPromptInput.Control> = output<IRtAiPromptInput.Control>();

    /** Ставит фокус в поле. */
    public focus(): void {
        this.textInput()?.nativeElement.focus();
    }

    protected onInput(event: Event): void {
        this.text.set((event.target as HTMLTextAreaElement).value);
    }

    protected onKeydown(event: KeyboardEvent): void {
        // Enter без Shift отправляет; подтверждение набора IME не перехватывается.
        if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
            event.preventDefault();
            this.submit();
        }
    }

    protected pick(control: IRtAiPromptInput.Control): void {
        this.controlPicked.emit(control);
    }

    protected stop(): void {
        if (this.isStoppable()) {
            this.stopped.emit();
        }
    }

    protected openPicker(): void {
        if (!this.locked()) {
            this.fileInput()?.nativeElement.click();
        }
    }

    protected onFilesPicked(event: Event): void {
        const el: HTMLInputElement = event.target as HTMLInputElement;
        const picked: File[] = el.files ? Array.from(el.files) : [];
        if (picked.length > 0) {
            this.files.update((current: File[]): File[] => [...current, ...picked]);
        }
        // Сброс значения: повторный выбор того же файла снова даёт событие.
        el.value = '';
    }

    protected removeFile(index: number): void {
        this.files.update((current: File[]): File[] => current.filter((_: File, i: number): boolean => i !== index));
    }

    protected submit(): void {
        if (!this.canSend()) {
            return;
        }
        this.submitted.emit({ text: this.text().trim(), files: this.attachments() ? this.files() : [] });
        this.text.set('');
        this.files.set([]);
    }
}
