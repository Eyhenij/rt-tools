import {
    booleanAttribute,
    computed,
    contentChild,
    forwardRef,
    input,
    model,
    output,
    signal,
    viewChildren,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    ModelSignal,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RtEmptyStateComponent } from '@rt-tools/ui-kit-v2/empty-state';
import { RtFormControlBase } from '@rt-tools/ui-kit-v2/form-control';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { RtPopoverDirective } from '@rt-tools/ui-kit-v2/popover';
import { TRtRadius } from '@rt-tools/ui-kit-v2/core';
import { RtDynamicSelectorListComponent } from './list/rt-dynamic-selector-list.component';
import { RtDynamicSelectorPopupComponent } from './popup/rt-dynamic-selector-popup.component';
import { RtDynamicSelectorRowControlsDirective, RtDynamicSelectorRowTitleDirective } from './rt-dynamic-selector.directives';
import {
    clearDynamicKeys,
    dynamicSelectorLabel,
    moveDynamicKey,
    sameDynamicKeys,
    selectableDynamicItems,
} from './rt-dynamic-selector.logic';
import { IRtDynamicSelector } from './rt-dynamic-selector.model';

const BEM_BLOCK: string = 'rt-dynamic-selector';

/**
 * Динамический селектор: поле формы со списком выбранных записей. Значение — массив ключей в
 * порядке списка. Записи добавляются всплывающим выбором, убираются корзиной строки, список
 * возвращается к записанному формой сбросом и пустеет очисткой — кроме строк только для чтения.
 *
 * @example
 * ```html
 * <rt-dynamic-selector keyExp="id" displayExp="name" [entities]="people()" [formControl]="team" />
 * ```
 */
@Component({
    selector: 'rt-dynamic-selector',
    templateUrl: './rt-dynamic-selector.component.html',
    styleUrl: './rt-dynamic-selector.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtDynamicSelectorListComponent,
        RtDynamicSelectorPopupComponent,
        RtEmptyStateComponent,
        RtPopoverDirective,
    ],
    providers: [
        // Алиас базового токена — для contentChild(RtFormControlBase) в rt-field.
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtDynamicSelectorComponent) },
    ],
    host: { class: BEM_BLOCK },
})
export class RtDynamicSelectorComponent<TEntity extends object> extends RtFormControlBase<unknown[]> {
    /** Последнее значение, записанное формой: к нему возвращает сброс. */
    readonly #initial: WritableSignal<unknown[]> = signal<unknown[]>([]);

    protected readonly addLabel: Signal<string> = rtKitLabel('dynamicSelectorAdd');
    protected readonly nothingToChooseLabel: Signal<string> = rtKitLabel('dynamicSelectorNothingToChoose');

    /** Всплывающий выбор открывается от нажатой кнопки добавления: у полосы и у приглашения — свой. */
    protected readonly popovers: Signal<readonly RtPopoverDirective[]> = viewChildren(RtPopoverDirective);
    protected readonly rowTitle: Signal<RtDynamicSelectorRowTitleDirective<TEntity> | undefined> =
        contentChild<RtDynamicSelectorRowTitleDirective<TEntity>>(RtDynamicSelectorRowTitleDirective);
    protected readonly rowControls: Signal<RtDynamicSelectorRowControlsDirective<TEntity> | undefined> = contentChild<
        RtDynamicSelectorRowControlsDirective<TEntity>
    >(RtDynamicSelectorRowControlsDirective);
    protected readonly titleTpl: Signal<TemplateRef<IRtDynamicSelector.RowContext<TEntity>> | null> = computed(
        (): TemplateRef<IRtDynamicSelector.RowContext<TEntity>> | null => this.rowTitle()?.templateRef ?? null
    );
    protected readonly controlsTpl: Signal<TemplateRef<IRtDynamicSelector.RowContext<TEntity>> | null> = computed(
        (): TemplateRef<IRtDynamicSelector.RowContext<TEntity>> | null => this.rowControls()?.templateRef ?? null
    );

    /** Выбранные записи в порядке значения; ключ, которого нет среди записей, строки не рисует. */
    protected readonly chosen: Signal<TEntity[]> = computed((): TEntity[] => this.#entitiesOf(this.value()));
    protected readonly rows: Signal<IRtDynamicSelector.ListRow<TEntity>[]> = computed((): IRtDynamicSelector.ListRow<TEntity>[] => {
        const locked: ReadonlyArray<unknown> = this.readonlyKeys();

        return this.chosen().map((item: TEntity): IRtDynamicSelector.ListRow<TEntity> => ({
            item,
            key: this.#keyOf(item),
            label: dynamicSelectorLabel(item, (entity: TEntity): unknown => this.#labelOf(entity)) ?? '',
            locked: locked.includes(this.#keyOf(item)),
        }));
    });
    /** Что предлагает всплывающий выбор: ещё не выбранное, в порядке вызывающего или по алфавиту. */
    protected readonly offered: Signal<TEntity[]> = computed((): TEntity[] =>
        selectableDynamicItems(
            this.entities(),
            this.value(),
            (item: TEntity): unknown => this.#keyOf(item),
            (item: TEntity): unknown => this.#labelOf(item),
            '',
            this.sortFn()
        )
    );
    protected readonly hasOffer: Signal<boolean> = computed((): boolean => this.offered().length > 0 || !this.localSearch());
    protected readonly isNothingToChoose: Signal<boolean> = computed((): boolean => this.value().length === 0 && !this.hasOffer());
    protected readonly isAddShown: Signal<boolean> = computed((): boolean => this.addShown() && this.hasOffer());
    protected readonly isKeysReset: Signal<boolean> = computed((): boolean => sameDynamicKeys(this.value(), this.#initial()));
    protected readonly isKeysClear: Signal<boolean> = computed(
        (): boolean => clearDynamicKeys(this.value(), this.readonlyKeys()).length === this.value().length
    );
    /** Правки в шаблоне строки держат сброс и очистку включёнными, даже когда ключи не менялись. */
    protected readonly isResetDisabled: Signal<boolean> = computed((): boolean => !this.extraChanged() && this.isKeysReset());
    protected readonly isClearDisabled: Signal<boolean> = computed((): boolean => !this.extraChanged() && this.isKeysClear());
    protected readonly addTitle: Signal<string> = computed((): string => this.buttonTitle() || this.addLabel());

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.value().length > 0);

    /** Записи, из которых выбирают; у каждой есть поле ключа и поле подписи. */
    public readonly entities: InputSignal<ReadonlyArray<TEntity>> = input<ReadonlyArray<TEntity>>([]);
    public readonly keyExp: InputSignal<keyof TEntity & string> = input.required<keyof TEntity & string>();
    public readonly displayExp: InputSignal<keyof TEntity & string> = input.required<keyof TEntity & string>();
    public readonly mode: InputSignal<IRtDynamicSelector.Mode> = input<IRtDynamicSelector.Mode>('multi');
    /** Название кнопки добавления; пустое — «Add» из словаря кита. */
    public readonly buttonTitle: InputSignal<string> = input<string>('');
    public readonly addShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /** Корзина строк; без неё записи убирает только очистка или сам вызывающий. */
    public readonly removeShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /** Сброс и очистка под списком: `false` их убирает, кнопка добавления остаётся. */
    public readonly listActionsShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /**
     * Строки правлены в шаблоне вызывающего: сброс и очистка включены и тогда, когда ключи прежние.
     * Сброс сообщает `listReset`, очистка — `listCleared`, и вызывающий снимает свои правки.
     */
    public readonly extraChanged: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    /** Запрос, с которым открывается всплывающий выбор; событием поиска он не уходит. */
    public readonly searchTerm: InputSignal<string> = input<string>('');
    /** Ключи, которые нельзя убрать из списка. */
    public readonly readonlyKeys: InputSignal<ReadonlyArray<unknown>> = input<ReadonlyArray<unknown>>([]);
    /** Ключи строк всплывающего выбора, под последней из которых стоит разделитель. */
    public readonly pinnedKeys: InputSignal<ReadonlyArray<unknown>> = input<ReadonlyArray<unknown>>([]);
    public readonly draggable: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    /** Шаг скругления кнопок-иконок списка; по умолчанию они круглые. */
    public readonly buttonRadius: InputSignal<TRtRadius | null> = input<TRtRadius | null>('full');
    /** Приглашение вместо полосы кнопок: значок, описание и кнопка добавления. */
    public readonly invitation: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly invitationIcon: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);
    public readonly invitationDescription: InputSignal<string> = input<string>('');
    public readonly multiToggleShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly selectAllShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    public readonly localSearch: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    public readonly lazyLoad: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly loading: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly fetching: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly navigateTitle: InputSignal<string> = input<string>('');
    public readonly navigateLink: InputSignal<string> = input<string>('');
    public readonly sortFn: InputSignal<((a: TEntity, b: TEntity) => number) | null> = input<((a: TEntity, b: TEntity) => number) | null>(
        null
    );

    /** Выбранные записи: те же, что уходят событием изменения выбора. */
    public readonly chosenEntities: ModelSignal<TEntity[]> = model<TEntity[]>([]);

    public readonly selectionChange: OutputEmitterRef<TEntity[]> = output<TEntity[]>();
    public readonly listReset: OutputEmitterRef<void> = output<void>();
    public readonly listCleared: OutputEmitterRef<void> = output<void>();
    /** Всплывающий выбор открылся или закрылся. */
    public readonly popupOpenChange: OutputEmitterRef<boolean> = output<boolean>();
    public readonly searchChange: OutputEmitterRef<string> = output<string>();
    public readonly loadMore: OutputEmitterRef<void> = output<void>();
    public readonly temporaryChoiceChange: OutputEmitterRef<TEntity[]> = output<TEntity[]>();

    /** Открыт ли всплывающий выбор — от кнопки полосы или от кнопки приглашения. */
    public readonly popupOpen: Signal<boolean> = computed((): boolean =>
        this.popovers().some((popover: RtPopoverDirective): boolean => popover.isOpen())
    );

    public readonly displayText: Signal<string> = computed((): string =>
        this.rows()
            .map((row: IRtDynamicSelector.ListRow<TEntity>): string => row.label)
            .join(', ')
    );

    /** Записанное формой становится и списком, и значением для сброса; пустой массив список опустошает. */
    public override writeValue(value: unknown[] | null): void {
        super.writeValue(value === null ? null : [...value]);
        this.#initial.set([...this.value()]);
    }

    protected onAdd(popover: RtPopoverDirective): void {
        if (!this.isDisabled()) {
            popover.open();
        }
    }

    protected onApplied(keys: unknown[]): void {
        this.#closePopup();
        this.#change(
            this.mode() === 'single'
                ? keys.slice(0, 1)
                : [...this.value(), ...keys.filter((key: unknown): boolean => !this.value().includes(key))]
        );
    }

    protected onCancelled(): void {
        this.#closePopup();
    }

    protected onRemoved(key: unknown): void {
        if (!this.isDisabled() && !this.readonlyKeys().includes(key)) {
            this.#change(this.value().filter((item: unknown): boolean => item !== key));
        }
    }

    protected onMoved(move: IRtDynamicSelector.Move): void {
        if (!this.isDisabled()) {
            this.#change(moveDynamicKey(this.value(), move.from, move.to));
        }
    }

    protected onReset(): void {
        if (this.isDisabled() || this.isResetDisabled()) {
            return;
        }

        // Ключи прежние, а правки только в строках: значение не трогаем, сообщаем о сбросе.
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

    protected onOpened(): void {
        this.popupOpenChange.emit(true);
    }

    protected onClosed(): void {
        this.markTouched();
        this.popupOpenChange.emit(false);
    }

    #closePopup(): void {
        for (const popover of this.popovers()) {
            popover.close();
        }
    }

    protected getEmptyValue(): unknown[] {
        return [];
    }

    protected focusAfterClear(): void {
        // Очистка крестиком у поля не ставится: фокус остаётся там, где был.
    }

    #change(keys: unknown[]): void {
        const entities: TEntity[] = this.#entitiesOf(keys);

        this.value.set(keys);
        this.emitChange(keys);
        this.chosenEntities.set(entities);
        this.selectionChange.emit(entities);
    }

    #entitiesOf(keys: ReadonlyArray<unknown>): TEntity[] {
        return keys
            .map((key: unknown): TEntity | undefined => this.entities().find((item: TEntity): boolean => this.#keyOf(item) === key))
            .filter((item: TEntity | undefined): item is TEntity => item !== undefined);
    }

    /** Ключ записи — по имени поля, которое назвал вызывающий. */
    #keyOf(item: TEntity): unknown {
        return item[this.keyExp()];
    }

    /** Подпись записи — по имени поля, которое назвал вызывающий. */
    #labelOf(item: TEntity): unknown {
        return item[this.displayExp()];
    }
}
