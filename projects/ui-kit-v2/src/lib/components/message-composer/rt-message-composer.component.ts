import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
    booleanAttribute,
    computed,
    effect,
    inject,
    input,
    numberAttribute,
    output,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, RtKitLabelMap, rtKitLabel } from '../../i18n';
import { IQuillDelta } from '../../util';

import { RtFileCardComponent } from '../file-card/rt-file-card.component';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtRichEditorComponent, IRtRichEditorToolbar } from '../rich-editor/rt-rich-editor.component';
import { IRtMessageComposer } from './rt-message-composer.model';

const BEM_BLOCK: string = 'rt-message-composer';

interface IComposerFormShape {
    message: FormControl<string>;
    files: FormControl<File[]>;
    delta: FormControl<IQuillDelta | null>;
}

/**
 * Композер сообщения: авто-растущая textarea сверху, под разделительной линией —
 * ряд контролов (слева — прикрепить файл, справа — отправить). Презентационный,
 * без data-access: наружу торчит только `submitted` с текстом и файлами.
 *
 * Отправка — `Enter` (без Shift) или клик по иконке; `Shift+Enter` — перенос
 * строки. Кнопка отправки активна, пока есть непустой текст или вложения.
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
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtMessageComposerComponent {
    readonly #formValue: Signal<Partial<{ message: string; files: File[]; delta: IQuillDelta | null }>>;

    readonly #t_chatPlaceholder: Signal<string> = rtKitLabel('chatPlaceholder');

    protected readonly t: Signal<RtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly placeholderText: Signal<string> = computed((): string => this.placeholder() || this.#t_chatPlaceholder());

    protected readonly fileInput: Signal<ElementRef<HTMLInputElement> | undefined> = viewChild<ElementRef<HTMLInputElement>>('fileEl');

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

    /** Текст-подсказка textarea. Пусто — берётся переведённое умолчание. */
    public readonly placeholder: InputSignal<string> = input<string>('');

    /** Фильтр типов для file-input (`.pdf,.doc,...`). */
    public readonly accept: InputSignal<string> = input<string>('');

    /** Показывать кнопку вложения и список файлов. */
    public readonly attachments: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Отправка в процессе — блокирует submit и показывает её недоступность. */
    public readonly sending: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
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
    public readonly toolbar: InputSignal<IRtRichEditorToolbar> = input<IRtRichEditorToolbar>('full');

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

    constructor() {
        this.#formValue = toSignal(this.form.valueChanges, {
            initialValue: this.form.value,
        });

        effect((): void => {
            const blocked: boolean = this.disabled() || this.sending();
            if (blocked && this.form.enabled) {
                this.form.disable({ emitEvent: false });
            }
            if (!blocked && this.form.disabled) {
                this.form.enable({ emitEvent: false });
            }
        });

        effect((): void => {
            const dropped: File[] | null = this.droppedFiles();
            if (dropped !== null && dropped.length > 0 && this.attachments()) {
                this.form.controls.files.setValue([...this.form.controls.files.value, ...dropped]);
            }
        });
    }

    protected onKeydown(event: KeyboardEvent): void {
        // Enter без модификаторов — отправка; Shift+Enter оставляем переносом строки.
        // isComposing — не перехватываем подтверждение IME-композиции.
        if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
            event.preventDefault();
            this.submit();
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
