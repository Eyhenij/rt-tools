import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
    booleanAttribute,
    computed,
    effect,
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
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { IQuillDelta, RT_KIT_LABELS, RtFileCardComponent, RtIconButtonComponent, rtKitLabel, TRtKitLabelMap } from '@rt-tools/ui-kit-v2';

import { RtRichEditorComponent, TRtRichEditorToolbar } from '../rich-editor/rt-rich-editor.component';
import { IRtMessageComposer } from './rt-message-composer.model';

const BEM_BLOCK: string = 'rt-message-composer';

/** Текст в поле выше полутора строк — он перенёсся, и капсула берёт скругление высокой. */
function rtComposerWraps(node: HTMLTextAreaElement): boolean {
    const style: CSSStyleDeclaration = getComputedStyle(node);
    const line: number = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5;
    const text: number = node.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    return text > line * 1.5;
}

interface IComposerFormShape {
    message: FormControl<string>;
    files: FormControl<File[]>;
    delta: FormControl<IQuillDelta | null>;
}

/**
 * Композер сообщения — капсула: слева круглая кнопка вложения, по центру авто-растущая
 * textarea, справа круглая кнопка отправки; вложения стоят внутри капсулы над строкой.
 * Презентационный, без data-access: наружу торчит только `submitted` с текстом и файлами.
 *
 * Отправка — `Enter` (без Shift) или клик по иконке; `Shift+Enter` — перенос
 * строки. Кнопка отправки активна, пока есть непустой текст или вложения.
 *
 * Со `stoppable` во время `sending` вместо стрелки стоит кнопка «Стоп», а поле
 * остаётся открытым: следующий вопрос набирается, пока идёт ответ.
 */
@Component({
    selector: 'rt-message-composer',
    templateUrl: './rt-message-composer.component.html',
    styleUrl: './rt-message-composer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        ReactiveFormsModule,

        // cdk
        CdkTextareaAutosize,

        // standalone components / directives
        RtFileCardComponent,
        RtIconButtonComponent,
        RtRichEditorComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtMessageComposerComponent {
    readonly #formValue: Signal<Partial<{ message: string; files: File[]; delta: IQuillDelta | null }>>;

    readonly #t_chatPlaceholder: Signal<string> = rtKitLabel('chatPlaceholder');

    /** Текст перенёсся на вторую строку — меряется по высоте textarea после отрисовки. */
    readonly #multiRow: WritableSignal<boolean> = signal(false);

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly placeholderText: Signal<string> = computed((): string => this.placeholder() || this.#t_chatPlaceholder());

    protected readonly fileInput: Signal<ElementRef<HTMLInputElement> | undefined> = viewChild<ElementRef<HTMLInputElement>>('fileEl');

    protected readonly textInput: Signal<ElementRef<HTMLTextAreaElement> | undefined> =
        viewChild<ElementRef<HTMLTextAreaElement>>('textEl');

    protected readonly richEditor: Signal<RtRichEditorComponent | undefined> = viewChild(RtRichEditorComponent);

    protected readonly form: FormGroup<IComposerFormShape> = new FormGroup<IComposerFormShape>({
        message: new FormControl<string>('', { nonNullable: true }),
        files: new FormControl<File[]>([], { nonNullable: true }),
        delta: new FormControl<IQuillDelta | null>(null),
    });

    protected readonly files: Signal<readonly File[]> = computed((): readonly File[] => this.#formValue().files ?? []);

    /** Отправка доступна: есть контент (текст/delta/файлы), композер не занят. */
    protected readonly canSend: Signal<boolean> = computed((): boolean => {
        if (this.sending() || this.disabled()) {
            return false;
        }
        const value: Partial<{ message: string; files: File[]; delta: IQuillDelta | null }> = this.#formValue();
        const hasFiles: boolean = this.attachments() && (value.files?.length ?? 0) > 0;
        if (this.formatting()) {
            return (value.delta ?? null) !== null || hasFiles;
        }
        const hasText: boolean = (value.message ?? '').trim().length > 0;
        return hasText || hasFiles;
    });

    /** Капсула выше одной строки: перенос текста, вложения или режим форматирования. */
    protected readonly tall: Signal<boolean> = computed(
        (): boolean => this.#multiRow() || this.formatting() || (this.attachments() && this.files().length > 0)
    );

    /** Идёт ответ, который можно остановить: вместо стрелки — «Стоп», поле открыто. */
    protected readonly isStoppable: Signal<boolean> = computed((): boolean => this.stoppable() && this.sending() && !this.disabled());

    protected readonly capsuleMods: Signal<Record<string, boolean>> = computed((): Record<string, boolean> => ({
        tall: this.tall(),
        disabled: this.disabled(),
    }));

    /** Текст-подсказка textarea. Пусто — берётся переведённое умолчание. */
    public readonly placeholder: InputSignal<string> = input<string>('');

    /** Фильтр типов для file-input (`.pdf,.doc,...`). */
    public readonly accept: InputSignal<string> = input<string>('');

    /** Строка под капсулой про Enter и Shift + Enter. */
    public readonly hint: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Показывать кнопку вложения и список файлов. */
    public readonly attachments: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Отправка в процессе — блокирует submit, кнопка отправки крутит индикатор. */
    public readonly sending: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Ответ на сообщение можно остановить. Во время `sending` стрелку сменяет кнопка
     * «Стоп», а поле не блокируется; без входа `sending` блокирует поле, как раньше.
     */
    public readonly stoppable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Полная блокировка композера. */
    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Rich-режим: вместо textarea — Quill-редактор, отправка уходит delta-каналом. */
    public readonly formatting: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Набор кнопок rich-редактора (проброс в `rt-rich-editor`). */
    public readonly toolbar: InputSignal<TRtRichEditorToolbar> = input<TRtRichEditorToolbar>('full');

    /** Минимальная высота textarea в строках. */
    public readonly minRows: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(1, { transform: numberAttribute });

    /** Максимальная высота textarea в строках (дальше — скролл). */
    public readonly maxRows: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(6, { transform: numberAttribute });

    /**
     * Файлы, выброшенные drag-n-drop'ом в обёртку чата: пробрасываются сюда как
     * вложения. Каждый физический drop даёт новый массив, поэтому effect
     * перезапускается на каждое перетаскивание; файлы добавляются к уже выбранным.
     */
    public readonly droppedFiles: InputSignal<File[] | null> = input<File[] | null>(null);

    /** Отправка сообщения: текст + файлы (последние — только при `attachments`). */
    public readonly submitted: OutputEmitterRef<IRtMessageComposer.SubmitPayload> = output<IRtMessageComposer.SubmitPayload>();

    /** Черновик поля без форматирования: задаётся снаружи, правки уходят наружу, после отправки пуст. */
    public readonly text: ModelSignal<string> = model<string>('');

    /** Клик по кнопке «Стоп» во время ответа, который можно остановить. */
    public readonly stopped: OutputEmitterRef<void> = output<void>();

    constructor() {
        this.#formValue = toSignal(this.form.valueChanges, {
            initialValue: this.form.value,
        });

        effect((): void => {
            const draft: string = this.text();
            if (this.form.controls.message.value !== draft) {
                this.form.controls.message.setValue(draft);
            }
        });

        this.form.controls.message.valueChanges.pipe(takeUntilDestroyed()).subscribe((value: string): void => this.text.set(value));

        effect((): void => {
            const blocked: boolean = this.disabled() || (this.sending() && !this.stoppable());
            if (blocked && this.form.enabled) {
                this.form.disable({ emitEvent: false });
            }
            if (!blocked && this.form.disabled) {
                this.form.enable({ emitEvent: false });
            }
        });

        // Поле пересоздаётся при смене режима форматирования: наблюдатель идёт за текущим узлом.
        effect((onCleanup: (fn: () => void) => void): void => {
            const node: HTMLTextAreaElement | undefined = this.textInput()?.nativeElement;
            if (!node || typeof ResizeObserver === 'undefined') {
                this.#multiRow.set(false);
                return;
            }
            const observer: ResizeObserver = new ResizeObserver((): void => this.#multiRow.set(rtComposerWraps(node)));
            observer.observe(node);
            onCleanup((): void => observer.disconnect());
        });

        effect((): void => {
            const dropped: File[] | null = this.droppedFiles();
            if (dropped !== null && dropped.length > 0 && this.attachments()) {
                this.form.controls.files.setValue([...this.form.controls.files.value, ...dropped]);
            }
        });
    }

    /** Ставит фокус в поле: в textarea, а в режиме форматирования — в rich-редактор. */
    public focus(): void {
        if (this.formatting()) {
            this.richEditor()?.focus();
            return;
        }
        this.textInput()?.nativeElement.focus();
    }

    protected onKeydown(event: KeyboardEvent): void {
        // Enter без модификаторов — отправка; Shift+Enter оставляем переносом строки.
        // isComposing — не перехватываем подтверждение IME-композиции.
        if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
            event.preventDefault();
            this.submit();
        }
    }

    protected stop(): void {
        if (this.isStoppable()) {
            this.stopped.emit();
        }
    }

    protected openPicker(): void {
        if (this.disabled() || this.sending()) {
            return;
        }
        this.fileInput()?.nativeElement.click();
    }

    protected onFilesPicked(event: Event): void {
        const el: HTMLInputElement = event.target as HTMLInputElement;
        const picked: File[] = el.files ? Array.from(el.files) : [];
        if (picked.length) {
            this.form.controls.files.setValue([...this.form.controls.files.value, ...picked]);
        }
        // Сброс value — чтобы повторный выбор того же файла снова дал change-событие.
        el.value = '';
    }

    protected removeFile(index: number): void {
        const next: File[] = this.form.controls.files.value.filter((_: File, i: number): boolean => i !== index);
        this.form.controls.files.setValue(next);
    }

    protected submit(): void {
        if (!this.canSend()) {
            return;
        }
        const files: File[] = this.attachments() ? this.form.controls.files.value : [];
        if (this.formatting()) {
            const delta: IQuillDelta | null = this.form.controls.delta.value;
            this.submitted.emit({
                text: '',
                delta: delta === null ? null : JSON.stringify(delta),
                files,
            });
        } else {
            const text: string = this.form.controls.message.value.trim();
            this.submitted.emit({ text, files });
        }
        this.form.reset({ message: '', files: [], delta: null });
    }
}
