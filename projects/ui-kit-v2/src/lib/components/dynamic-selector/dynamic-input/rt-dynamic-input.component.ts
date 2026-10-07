import {
    afterNextRender,
    booleanAttribute,
    computed,
    contentChild,
    forwardRef,
    inject,
    input,
    output,
    signal,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Injector,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RtEmptyStateComponent } from '@rt-tools/ui-kit-v2/empty-state';
import { RtFormControlBase } from '@rt-tools/ui-kit-v2/form-control';
import { IButton, IRtIcon, IRtInput } from '@rt-tools/ui-kit-v2/core';
import { RtInputComponent } from '@rt-tools/ui-kit-v2/input';
import { TRtRadius } from '@rt-tools/ui-kit-v2/core';
import { RtDynamicSelectorListComponent } from '../list/rt-dynamic-selector-list.component';
import { RtDynamicSelectorRowControlsDirective } from '../rt-dynamic-selector.directives';
import { addDynamicText, clearDynamicKeys, moveDynamicKey, renameDynamicText, sameDynamicKeys } from '../rt-dynamic-selector.logic';
import { IRtDynamicSelector } from '../rt-dynamic-selector.model';

const BEM_BLOCK: string = 'rt-dynamic-input';

/**
 * Поле списка строк: строки человек набирает сам. Значение — массив строк в порядке списка.
 * Enter или уход из поля добавляют срезанный по краям текст в конец; пустой и повторный не
 * добавляются. Сброс, очистка, удаление строки и перетаскивание — те же, что у селектора.
 *
 * @example
 * ```html
 * <rt-dynamic-input editable [formControl]="tags" />
 * ```
 */
@Component({
    selector: 'rt-dynamic-input',
    templateUrl: './rt-dynamic-input.component.html',
    styleUrl: './rt-dynamic-input.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        FormsModule,

        // standalone components / directives
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtDynamicSelectorListComponent,
        RtEmptyStateComponent,
        RtInputComponent,
    ],
    providers: [
        // Алиас базового токена — для contentChild(RtFormControlBase) в rt-field.
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtDynamicInputComponent) },
    ],
    host: { class: BEM_BLOCK },
})
export class RtDynamicInputComponent extends RtFormControlBase<string[]> {
    readonly #injector: Injector = inject(Injector);
    /** Последнее значение, записанное формой: к нему возвращает сброс. */
    readonly #initial: WritableSignal<string[]> = signal<string[]>([]);

    protected readonly addLabel: Signal<string> = rtKitLabel('dynamicSelectorAdd');
    protected readonly placeholderLabel: Signal<string> = rtKitLabel('dynamicInputPlaceholder');

    protected readonly field: Signal<ElementRef<HTMLElement> | undefined> = viewChild('field', { read: ElementRef });
    protected readonly rowControls: Signal<RtDynamicSelectorRowControlsDirective<string> | undefined> = contentChild<
        RtDynamicSelectorRowControlsDirective<string>
    >(RtDynamicSelectorRowControlsDirective);
    protected readonly controlsTpl: Signal<TemplateRef<IRtDynamicSelector.RowContext<string>> | null> = computed(
        (): TemplateRef<IRtDynamicSelector.RowContext<string>> | null => this.rowControls()?.templateRef ?? null
    );

    /** Поле набора открыто, и в нём текст. */
    protected readonly isFieldShown: WritableSignal<boolean> = signal<boolean>(false);
    protected readonly draft: WritableSignal<string> = signal<string>('');
    /** Приглашение снимается нажатием его кнопки и до новой записи формы не возвращается. */
    protected readonly isInvitationDismissed: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly rows: Signal<IRtDynamicSelector.ListRow<string>[]> = computed((): IRtDynamicSelector.ListRow<string>[] => {
        const locked: ReadonlyArray<string> = this.readonlyKeys();

        return this.value().map((text: string): IRtDynamicSelector.ListRow<string> => ({
            item: text,
            key: text,
            label: text,
            locked: locked.includes(text),
        }));
    });
    protected readonly isInvitationShown: Signal<boolean> = computed((): boolean => this.invitation() && !this.isInvitationDismissed());
    protected readonly isAddShown: Signal<boolean> = computed((): boolean => !this.isFieldShown());
    protected readonly isKeysReset: Signal<boolean> = computed((): boolean => sameDynamicKeys(this.value(), this.#initial()));
    protected readonly isKeysClear: Signal<boolean> = computed(
        (): boolean => clearDynamicKeys(this.value(), this.readonlyKeys()).length === this.value().length
    );
    /** Правки в шаблоне строки держат сброс и очистку включёнными, даже когда строки не менялись. */
    protected readonly isResetDisabled: Signal<boolean> = computed((): boolean => !this.extraChanged() && this.isKeysReset());
    protected readonly isClearDisabled: Signal<boolean> = computed((): boolean => !this.extraChanged() && this.isKeysClear());
    protected readonly addTitle: Signal<string> = computed((): string => this.buttonTitle() || this.addLabel());
    protected readonly fieldPlaceholder: Signal<string> = computed((): string => this.placeholder() || this.placeholderLabel());

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.value().length > 0);

    public readonly buttonTitle: InputSignal<string> = input<string>('');
    public readonly placeholder: InputSignal<string> = input<string>('');
    /** Строки, которые нельзя убрать из списка. */
    public readonly readonlyKeys: InputSignal<ReadonlyArray<string>> = input<ReadonlyArray<string>>([]);
    public readonly draggable: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    /** Шаг скругления кнопок-иконок списка; по умолчанию они круглые. */
    public readonly buttonRadius: InputSignal<TRtRadius | null> = input<TRtRadius | null>('full');
    public readonly editable: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly invitation: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly invitationIcon: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);
    public readonly invitationDescription: InputSignal<string> = input<string>('');
    /** Значок кнопки приглашения; null — кнопка без значка. */
    public readonly invitationButtonIcon: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);
    /** Вид кнопки приглашения — тот же набор, что у кнопки кита. */
    public readonly invitationButtonAppearance: InputSignal<IButton.Appearance> = input<IButton.Appearance>('outlined');
    /** Значок кнопки «Очистить список». */
    public readonly clearIcon: InputSignal<IRtIcon.Name> = input<IRtIcon.Name>('close');
    /** Вид поля, в которое вводят новую строку. */
    public readonly fieldAppearance: InputSignal<IRtInput.Appearance> = input<IRtInput.Appearance>('outline');
    /** Корзина строк; без неё строки убирает только очистка или сам вызывающий. */
    public readonly removeShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /** Сброс и очистка под списком: `false` их убирает, кнопка добавления остаётся. */
    public readonly listActionsShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /**
     * Строки правлены в шаблоне вызывающего: сброс и очистка включены и тогда, когда строки прежние.
     * Сброс сообщает `listReset`, очистка — `listCleared`, и вызывающий снимает свои правки.
     */
    public readonly extraChanged: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });

    public readonly listReset: OutputEmitterRef<void> = output<void>();
    public readonly listCleared: OutputEmitterRef<void> = output<void>();

    public readonly displayText: Signal<string> = computed((): string => this.value().join(', '));

    /** Записанное формой становится и списком, и значением для сброса; пустой массив список опустошает. */
    public override writeValue(value: string[] | null): void {
        super.writeValue(value === null ? null : [...value]);
        this.#initial.set([...this.value()]);
        this.isInvitationDismissed.set(false);
    }

    protected onAdd(): void {
        if (this.isDisabled()) {
            return;
        }

        this.isInvitationDismissed.set(true);
        this.draft.set('');
        this.isFieldShown.set(true);
        afterNextRender((): void => this.field()?.nativeElement.querySelector('input')?.focus(), { injector: this.#injector });
    }

    /** Enter или уход из поля: пустой текст поле не закрывает, повторный закрывает без изменений. */
    protected onCommit(): void {
        if (!this.isFieldShown() || this.draft().trim() === '') {
            return;
        }

        const next: string[] = addDynamicText(this.value(), this.draft());

        this.draft.set('');
        this.isFieldShown.set(false);
        this.markTouched();

        if (next.length !== this.value().length) {
            this.#change(next);
        }
    }

    protected onRemoved(key: unknown): void {
        if (!this.isDisabled() && typeof key === 'string' && !this.readonlyKeys().includes(key)) {
            this.#change(this.value().filter((text: string): boolean => text !== key));
        }
    }

    protected onMoved(move: IRtDynamicSelector.Move): void {
        if (!this.isDisabled()) {
            this.#change(moveDynamicKey(this.value(), move.from, move.to));
        }
    }

    protected onEdited(edit: IRtDynamicSelector.TextEdit): void {
        const next: string[] = renameDynamicText(this.value(), edit.previous, edit.next);

        if (!this.isDisabled() && !sameDynamicKeys(next, this.value())) {
            this.#change(next);
        }
    }

    protected onReset(): void {
        if (this.isDisabled() || this.isResetDisabled()) {
            return;
        }

        // Строки прежние, а правки только в шаблоне: значение не трогаем, сообщаем о сбросе.
        if (!this.isKeysReset()) {
            this.#change([...this.#initial()]);
        }
        this.listReset.emit();
    }

    protected onCleared(): void {
        if (this.isDisabled() || this.isClearDisabled()) {
            return;
        }

        if (!this.isKeysClear()) {
            this.#change(clearDynamicKeys(this.value(), this.readonlyKeys()));
        }
        this.listCleared.emit();
    }

    protected getEmptyValue(): string[] {
        return [];
    }

    protected focusAfterClear(): void {
        // Очистка крестиком у поля не ставится: фокус остаётся там, где был.
    }

    #change(values: string[]): void {
        this.value.set(values);
        this.emitChange(values);
    }
}
