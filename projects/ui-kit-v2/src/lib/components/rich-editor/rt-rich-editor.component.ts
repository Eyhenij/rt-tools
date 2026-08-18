import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    forwardRef,
    input,
    InputSignal,
    OnDestroy,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import type Quill from 'quill';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { coerceQuillDeltaOutput, IQuillDelta, IQuillDeltaOp } from '../../util';

import { RtFormControlBase } from '../form-control/rt-form-control.base';

const BEM_BLOCK: string = 'rt-rich-editor';

/**
 * Режим тулбара: `full` — весь whitelist, `minimal` — жирный + два списка
 * (G113: чаты оператора/админа/саппорта).
 */
export type TRtRichEditorToolbar = 'full' | 'minimal';

/** Модули тулбара — строго whitelist (без link/image/color/script). */
const TOOLBAR: Record<TRtRichEditorToolbar, readonly unknown[]> = {
    full: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ header: 1 }, { header: 2 }, { header: 3 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block'],
    ],
    minimal: [['bold'], [{ list: 'ordered' }, { list: 'bullet' }]],
};

/** Форматы, которые Quill вообще примет (вставленное из буфера лишнее вырезается). */
const FORMATS: Record<TRtRichEditorToolbar, readonly string[]> = {
    full: ['bold', 'italic', 'underline', 'strike', 'header', 'list', 'blockquote', 'code-block'],
    minimal: ['bold', 'list'],
};

type TQuillContentsArg = Parameters<Quill['setContents']>[0];

/**
 * Rich-редактор чата на Quill. Наследует CVA-ядро input-семейства
 * (`RtFormControlBase`) — плагается в reactive-форму. Quill грузится **лениво**
 * (`import("quill")` в `ngAfterViewInit`), тип импортируется `import type` и в
 * бандл не попадает. Значение CVA — `IQuillDelta` (или `null`, когда пусто).
 */
@Component({
    selector: 'rt-rich-editor',
    templateUrl: './rt-rich-editor.component.html',
    styleUrl: './rt-rich-editor.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
    ],
    providers: [
        // Алиас базового токена — чтобы rt-field мог найти контрол через
        // contentChild(RtFormControlBase) (query по абстрактному классу).
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtRichEditorComponent) },
    ],
    host: {
        class: BEM_BLOCK,
        // Пока начинка редактора не смонтирована, хост несёт признак недостроенности: снаружи
        // недостроенный редактор ничем не отличается от достроенного пустого, и съёмка витрины
        // ловила именно этот промежуток — кадр выходил втрое ниже эталона.
        '[attr.data-rt-pending]': 'mounted() ? null : ""',
    },
})
export class RtRichEditorComponent extends RtFormControlBase<IQuillDelta | null> implements AfterViewInit, OnDestroy {
    // `viewChild` не работает на ES-private (`#`) поле — держим `protected`.
    protected readonly editorHost: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>('editor');

    #quill: Quill | null = null;

    /** Значение, пришедшее через writeValue до готовности Quill. */
    #pending: IQuillDelta | null = null;

    /**
     * Смонтирована ли начинка редактора. Пока нет, хост несёт признак недостроенности: съёмке
     * витрины и любой другой проверке снаружи иначе нечем отличить недостроенный редактор от
     * достроенного пустого — оба выглядят пустым местом.
     */
    protected readonly mounted: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.value() !== null);

    public readonly placeholder: InputSignal<string> = input<string>('');

    /** Набор кнопок форматирования; сужает и принимаемые форматы (вставка из буфера). */
    public readonly toolbar: InputSignal<TRtRichEditorToolbar> = input<TRtRichEditorToolbar>('full');

    /** Enter без Shift в редакторе — сигнал отправки (Shift+Enter остаётся переносом). */
    public readonly enterPressed: OutputEmitterRef<void> = output<void>();

    public readonly displayText: Signal<string> = computed((): string => {
        const delta: IQuillDelta | null = this.value();
        if (delta === null) {
            return '';
        }
        return delta.ops.map((op: IQuillDeltaOp): string => op.insert).join('');
    });

    public async ngAfterViewInit(): Promise<void> {
        const QuillCtor: typeof Quill = (await import('quill')).default;
        const quill: Quill = new QuillCtor(this.editorHost().nativeElement, {
            theme: 'snow',
            placeholder: this.placeholder(),
            formats: [...FORMATS[this.toolbar()]],
            modules: {
                toolbar: [...TOOLBAR[this.toolbar()]],
                keyboard: {
                    bindings: {
                        // Enter без Shift — отправка (перенос гасим возвратом false);
                        // Shift+Enter не совпадает с биндингом и уходит в дефолт (перенос).
                        enterSubmit: {
                            key: 'Enter',
                            shiftKey: false,
                            handler: (): boolean => {
                                this.enterPressed.emit();
                                return false;
                            },
                        },
                    },
                },
            },
        });
        this.#quill = quill;
        if (this.#pending !== null) {
            quill.setContents(this.#pending as unknown as TQuillContentsArg);
            this.#pending = null;
        }
        if (this.isDisabled()) {
            quill.disable();
        }
        quill.on('text-change', (): void => this.#onEditorChange());
        this.mounted.set(true);
    }

    public ngOnDestroy(): void {
        this.#quill = null;
        this.mounted.set(false);
    }

    public override writeValue(value: IQuillDelta | null): void {
        super.writeValue(value);
        if (this.#quill === null) {
            this.#pending = value;
            return;
        }
        this.#quill.setContents((value ?? { ops: [] }) as unknown as TQuillContentsArg);
    }

    public override setDisabledState(isDisabled: boolean): void {
        super.setDisabledState(isDisabled);
        if (this.#quill === null) {
            return;
        }
        if (isDisabled) {
            this.#quill.disable();
            return;
        }
        this.#quill.enable();
    }

    protected getEmptyValue(): IQuillDelta | null {
        return null;
    }

    protected focusAfterClear(): void {
        this.#quill?.focus();
    }

    /** Text-change: пустой слепок → null-канал; иначе delta. */
    #onEditorChange(): void {
        if (this.#quill === null) {
            return;
        }
        const blank: boolean = this.#quill.getText().trim().length === 0;
        const next: IQuillDelta | null = blank
            ? null
            : coerceQuillDeltaOutput({
                  ops: this.#quill.getContents().ops as unknown as IQuillDeltaOp[],
              });
        this.value.set(next);
        this.emitChange(next);
        this.markTouched();
    }
}
