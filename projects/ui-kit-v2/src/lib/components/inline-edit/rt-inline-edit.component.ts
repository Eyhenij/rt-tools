import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    Injector,
    input,
    InputSignal,
    InputSignalWithTransform,
    model,
    ModelSignal,
    output,
    OutputEmitterRef,
    signal,
    Signal,
    untracked,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { IRtIcon, IRtInput, rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtInputComponent } from '@rt-tools/ui-kit-v2/input';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';
import { inlineEditLeaves, inlineEditMiddle, inlineEditOutcome } from './rt-inline-edit.logic';
import { IRtInlineEdit } from './rt-inline-edit.model';

const BEM_BLOCK: string = 'rt-inline-edit';

/**
 * Правка короткого значения на месте. В покое значение — кнопка с карандашом; нажатие открывает поле
 * кита с черновиком, кнопкой сохранения и кнопкой отмены. Enter сохраняет, Escape отменяет.
 *
 * Значение принадлежит приложению: компонент отдаёт новое выходом и сам его не хранит. Приложение,
 * которое отвечает позже, держит поле открытым входом `closeOnSave` и закрывает его само.
 */
@Component({
    selector: 'rt-inline-edit',
    templateUrl: './rt-inline-edit.component.html',
    styleUrl: './rt-inline-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        ReactiveFormsModule,
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtIconComponent,
        RtIconButtonComponent,
        RtInputComponent,
        RtTooltipDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-inline-edit--chip]': "look() === 'chip'",
        '[class.rt-inline-edit--chip-field]': 'isChipField()',
        '[class.rt-inline-edit--size-md]': "size() === 'md'",
        '[class.rt-inline-edit--size-lg]': "size() === 'lg'",
        '(focusin)': 'onFocusIn()',
        '(focusout)': 'onFocusOut($event)',
    },
})
export class RtInlineEditComponent {
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);
    readonly #injector: Injector = inject(Injector);

    readonly #t_uiEdit: Signal<string> = rtKitLabel('uiEdit');

    /**
     * Фокус был внутри и не ушёл на другой элемент страницы. Недоступное на время сохранения поле
     * роняет фокус в никуда, и без этой отметки его некуда вернуть, когда поле закроет приложение.
     */
    #focusInside: boolean = false;
    #wasEditing: boolean = false;
    #wasSaving: boolean = false;
    /** Фокус в поле плашки: пока человек правит, новое значение приложения не переписывает черновик. */
    #chipFocused: boolean = false;
    /** Enter или Escape уже сохранили черновик и снимают фокус сами: уход не сохраняет второй раз. */
    #chipLeaving: boolean = false;

    protected readonly saveLabel: Signal<string> = rtKitLabel('uiSave');
    protected readonly cancelLabel: Signal<string> = rtKitLabel('uiCancel');

    /** Что видно в покое: значение, а пустое — подсказка. */
    protected readonly shown: Signal<string> = computed((): string => this.value() || this.placeholder());
    protected readonly isEmpty: Signal<boolean> = computed((): boolean => this.value() === '');
    /** Имя кнопки покоя: действие и то, что правится. */
    protected readonly startLabel: Signal<string> = computed((): string => `${this.#t_uiEdit()}: ${this.shown()}`);

    /** Что набрано в открытом поле; зеркало поля для расчёта доступности сохранения. */
    readonly #draft: WritableSignal<string> = signal('');

    /**
     * Поле черновика. Форма, а не двусторонняя привязка: форма пишет значение в поле в том же
     * проходе отрисовки, и выделение текста при открытии застаёт его на месте.
     */
    protected readonly draftControl: FormControl<string> = new FormControl<string>('', { nonNullable: true });
    protected readonly canSave: Signal<boolean> = computed(
        (): boolean => inlineEditOutcome(this.value(), this.#draft(), this.allowEmpty()).kind !== 'refuse'
    );

    /** Плашка сама остаётся полем: нет покоя и открытия, нет кнопок. */
    protected readonly isChipField: Signal<boolean> = computed((): boolean => this.look() === 'chip-field');
    /** Текст, по которому плашка-поле берёт ширину: черновик, а пустой — подсказка. */
    protected readonly chipText: Signal<string> = computed((): string => this.#draft() || this.placeholder());
    /** Видимый вне фокуса текст плашки-поля, разрезанный посередине; пустой черновик не режется. */
    protected readonly middleParts: Signal<IRtInlineEdit.MiddleParts | null> = computed((): IRtInlineEdit.MiddleParts | null =>
        this.truncate() === 'middle' && this.#draft() !== '' ? inlineEditMiddle(this.#draft()) : null
    );

    /** Значение приложения: видно в покое и встаёт в поле при открытии. */
    public readonly value: InputSignal<string> = input.required<string>();
    /** Подсказка пустого значения в покое и пустого поля. */
    public readonly placeholder: InputSignal<string> = input<string>('');
    /** Вид в покое: строка текста или плашка. */
    public readonly look: InputSignal<IRtInlineEdit.Look> = input<IRtInlineEdit.Look>('text');
    /** Где плашка-поле режет длинный текст вне фокуса. Читается только видом `chip-field`. */
    public readonly truncate: InputSignal<IRtInlineEdit.Truncate> = input<IRtInlineEdit.Truncate>('end');
    /** Ступень поля и кнопок. */
    public readonly size: InputSignal<IRtInput.Size> = input<IRtInput.Size>('sm');
    /** Имя поля для чтения экрана; пусто — подсказка поля. */
    public readonly fieldLabel: InputSignal<string> = input<string>('');
    /** Компонент недоступен: поле не открывается. */
    public readonly disabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });
    /** Приложение сохраняет: кнопка сохранения крутится, поле и отмена недоступны. */
    public readonly saving: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });
    /** Пустой черновик сохраняется; выключено — кнопка сохранения недоступна. */
    public readonly allowEmpty: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    /** Поле закрывается при сохранении; выключено — его закрывает приложение через `editing`. */
    public readonly closeOnSave: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /** Что делает уход фокуса из компонента. */
    public readonly blurAction: InputSignal<IRtInlineEdit.BlurAction> = input<IRtInlineEdit.BlurAction>('keep');
    /** Значок перед текстом плашки-поля: имя значка кита. */
    public readonly fieldIcon: InputSignal<IRtIcon.Name> = input<IRtIcon.Name>('pencil');

    /** Поле открыто. Приложение может открыть и закрыть его само. */
    public readonly editing: ModelSignal<boolean> = model<boolean>(false);

    /** Новое значение, уже обрезанное по краям. Равное прежнему не уходит. */
    public readonly saved: OutputEmitterRef<string> = output<string>();
    /** Правка отменена: поле закрыто, значение прежнее. */
    public readonly cancelled: OutputEmitterRef<void> = output<void>();

    constructor() {
        this.draftControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((draft: string): void => this.#draft.set(draft));

        // Поле открылось — нажатием или входом приложения: черновик берёт значение, фокус встаёт в поле.
        // Поле закрылось — своей кнопкой или входом приложения: фокус возвращается на значение.
        effect((): void => {
            const editing: boolean = this.editing();

            if (editing) {
                this.draftControl.setValue(untracked(this.value));
                afterNextRender((): void => this.focusField(), { injector: this.#injector });
            } else if (this.#wasEditing) {
                this.#restoreFocus('.rt-inline-edit__value');
            } else {
                // Покой без перехода: фокус никто не трогает.
            }
            this.#wasEditing = editing;
        });

        // Плашка-поле показывает значение приложения, пока человек её не правит.
        effect((): void => {
            const value: string = this.value();

            if (this.isChipField() && !this.#chipFocused) {
                this.draftControl.setValue(value);
            }
        });

        // Пока приложение сохраняет, поле недоступно; отказ оставил поле открытым — фокус снова в нём.
        // Плашка-поле всегда на месте, и недоступный компонент запирает её саму.
        effect((): void => {
            const saving: boolean = this.saving();

            if (saving || (this.isChipField() && this.disabled())) {
                this.draftControl.disable({ emitEvent: false });
            } else {
                this.draftControl.enable({ emitEvent: false });
                if (this.#wasSaving && untracked(this.editing)) {
                    this.#restoreFocus('.rt-inline-edit__field input');
                }
            }
            this.#wasSaving = saving;
        });
    }

    /** Нажатие на значение в покое. */
    public open(): void {
        if (this.disabled() || this.editing()) {
            return;
        }
        this.editing.set(true);
    }

    public save(): void {
        if (this.saving()) {
            return;
        }
        const outcome: IRtInlineEdit.Outcome = inlineEditOutcome(this.value(), this.draftControl.value, this.allowEmpty());

        if (outcome.kind === 'refuse') {
            return;
        }
        if (outcome.kind === 'save') {
            this.saved.emit(outcome.value);
            if (!this.closeOnSave()) {
                return;
            }
        }
        this.#close();
    }

    public cancel(): void {
        if (this.saving()) {
            return;
        }
        this.#close();
        this.cancelled.emit();
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.save();
        } else if (event.key === 'Escape') {
            // Escape принадлежит полю: окно или панель вокруг не закрываются вместе с правкой.
            event.preventDefault();
            event.stopPropagation();
            this.cancel();
        } else {
            // Остальные клавиши правят черновик в самом поле.
        }
    }

    protected onFocusIn(): void {
        this.#focusInside = true;
    }

    protected onFocusOut(event: FocusEvent): void {
        if (event.relatedTarget instanceof Node && !this.#host.nativeElement.contains(event.relatedTarget)) {
            this.#focusInside = false;
        }
        if (!this.editing() || this.saving() || !inlineEditLeaves(this.#host.nativeElement, event.relatedTarget)) {
            return;
        }
        if (this.blurAction() === 'save') {
            this.save();
        } else if (this.blurAction() === 'cancel') {
            this.cancel();
        } else {
            // Поле держится открытым: случайное нажатие мимо не теряет набранное.
        }
    }

    /** Фокус пришёл в плашку-поле: весь текст выделен, и первое нажатие заменяет значение целиком. */
    protected onChipFocus(event: FocusEvent): void {
        this.#chipFocused = true;
        if (event.target instanceof HTMLInputElement) {
            event.target.select();
        }
    }

    /** Уход из плашки-поля сохраняет черновик. */
    protected onChipBlur(): void {
        this.#chipFocused = false;
        if (!this.#chipLeaving) {
            this.#commitChip();
        }
    }

    protected onChipKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.#leaveChip(event);
        } else if (event.key === 'Escape') {
            // Escape принадлежит полю: окно или панель вокруг не закрываются вместе с правкой.
            event.preventDefault();
            event.stopPropagation();
            this.draftControl.setValue(this.value());
            this.#leaveChip(event);
            this.cancelled.emit();
        } else {
            // Остальные клавиши правят черновик в самом поле.
        }
    }

    /** Фокус в поле и весь текст выделен: первое нажатие клавиши заменяет значение целиком. */
    protected focusField(): void {
        const field: HTMLInputElement | null = this.#host.nativeElement.querySelector('.rt-inline-edit__field input');

        field?.focus();
        field?.select();
    }

    #close(): void {
        this.editing.set(false);
    }

    /**
     * Черновик плашки-поля уходит приложению. Пустой, который не разрешён, и равный значению молча
     * возвращают значение: у плашки нет недоступной кнопки, которой можно было бы отказать.
     */
    #commitChip(): void {
        if (this.saving()) {
            return;
        }
        const outcome: IRtInlineEdit.Outcome = inlineEditOutcome(this.value(), this.draftControl.value, this.allowEmpty());

        if (outcome.kind === 'save') {
            this.saved.emit(outcome.value);
            this.draftControl.setValue(outcome.value);
        } else {
            this.draftControl.setValue(this.value());
        }
    }

    /** Enter и Escape сохраняют сами и снимают фокус: уход, который за этим следует, не сохраняет второй раз. */
    #leaveChip(event: KeyboardEvent): void {
        const target: EventTarget | null = event.target;

        this.#commitChip();
        if (target instanceof HTMLElement && target.ownerDocument.activeElement === target) {
            this.#chipLeaving = true;
            target.blur();
            this.#chipLeaving = false;
        }
    }

    /**
     * Фокус, бывший внутри, возвращается на элемент компонента после отрисовки. Ушедший на другой
     * элемент страницы не трогается: человек уже там.
     */
    #restoreFocus(selector: string): void {
        const host: HTMLElement = this.#host.nativeElement;
        const active: Element | null = host.ownerDocument.activeElement;

        if (!this.#focusInside || (active !== null && active !== host.ownerDocument.body && !host.contains(active))) {
            return;
        }
        afterNextRender((): void => host.querySelector<HTMLElement>(selector)?.focus(), { injector: this.#injector });
    }
}
