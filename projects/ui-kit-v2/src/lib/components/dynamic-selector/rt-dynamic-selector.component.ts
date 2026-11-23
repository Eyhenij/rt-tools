import {
    booleanAttribute,
    computed,
    contentChild,
    forwardRef,
    inject,
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
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RtEmptyStateComponent } from '@rt-tools/ui-kit-v2/empty-state';
import { RtFormControlBase } from '@rt-tools/ui-kit-v2/form-control';
import { IButton, IRtIcon, IRtInput } from '@rt-tools/ui-kit-v2/core';
import { RtPopoverDirective, RtSheetTemplatesDirective } from '@rt-tools/ui-kit-v2/popover';
import { TRtRadius } from '@rt-tools/ui-kit-v2/core';
import { RtDynamicSelectorListComponent } from './list/rt-dynamic-selector-list.component';
import { RtDynamicSelectorPopupComponent } from './popup/rt-dynamic-selector-popup.component';
import { RtDynamicSelectorRowControlsDirective, RtDynamicSelectorRowTitleDirective } from './rt-dynamic-selector.directives';
import { IRtDynamicSelectorDefaults, rtDynamicSelectorDefaults } from './rt-dynamic-selector-defaults';
import { RtDynamicSelectorLoadStateDirective } from './rt-dynamic-selector-load-state.directive';
import {
    clearDynamicKeys,
    moveDynamicKey,
    sameDynamicKeys,
    sameDynamicKeySet,
    dynamicEntitiesOf,
    dynamicLabelCase,
    dynamicListRows,
    selectableDynamicItems,
} from './rt-dynamic-selector.logic';
import { IRtDynamicSelector } from './rt-dynamic-selector.model';
import { RtDynamicSelectorPartsService } from './rt-dynamic-selector-parts.service';

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
        RtDynamicSelectorPartsService,
    ],
    hostDirectives: [
        { directive: RtDynamicSelectorLoadStateDirective, inputs: ['error', 'errorDescription'], outputs: ['retry'] },
        { directive: RtSheetTemplatesDirective, inputs: ['sheetHeaderTemplate', 'sheetFooterTemplate'] },
    ],
    host: { class: BEM_BLOCK },
})
export class RtDynamicSelectorComponent<TEntity extends object> extends RtFormControlBase<unknown[]> {
    /** Последнее значение, записанное формой: к нему возвращает сброс. */
    readonly #initial: WritableSignal<unknown[]> = signal<unknown[]>([]);
    readonly #parts: RtDynamicSelectorPartsService<TEntity> = inject<RtDynamicSelectorPartsService<TEntity>>(RtDynamicSelectorPartsService);
    readonly #loadState: RtDynamicSelectorLoadStateDirective = inject(RtDynamicSelectorLoadStateDirective, { self: true });
    /* Умолчания входов считаются из настроек кита при объявлении: вход в разметке перебивает их. */
    readonly #defaults: IRtDynamicSelectorDefaults = rtDynamicSelectorDefaults();
    readonly #applyKitLabel: Signal<string> = rtKitLabel('dynamicSelectorApply');

    protected readonly addLabel: Signal<string> = rtKitLabel('dynamicSelectorAdd');
    protected readonly nothingToChooseLabel: Signal<string> = rtKitLabel('dynamicSelectorNothingToChoose');
    /** Подпись «Применить» в шапке шторки — та же, что у кнопки окна выбора. */
    protected readonly applyText: Signal<string> = computed((): string =>
        dynamicLabelCase(this.applyLabel() || this.#applyKitLabel(), this.applyLabelCase())
    );
    /** Ключи, отмеченные в открытом окне и ещё не применённые: с ними шторка спрашивает перед закрытием. */
    protected readonly pendingKeys: Signal<unknown[]> = this.#parts.ticked;
    protected readonly sheetUnsaved: Signal<boolean> = computed((): boolean => this.pendingKeys().length > 0);

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
    protected readonly rows: Signal<IRtDynamicSelector.ListRow<TEntity>[]> = computed((): IRtDynamicSelector.ListRow<TEntity>[] =>
        dynamicListRows(
            this.chosen(),
            this.readonlyKeys(),
            (item: TEntity): unknown => this.#keyOf(item),
            (item: TEntity): unknown => this.#labelOf(item)
        )
    );
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
    protected readonly hasOffer: Signal<boolean> = computed(
        (): boolean => this.offered().length > 0 || !this.localSearch() || this.#loadState.error() !== null
    );
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
    /** Подпись записи для строки, пункта окна и поиска; не задана — поле `displayExp`. */
    public readonly displayWith: InputSignal<((entity: TEntity) => string) | null> = input<((entity: TEntity) => string) | null>(null);
    public readonly mode: InputSignal<IRtDynamicSelector.Mode> = input<IRtDynamicSelector.Mode>('multi');
    /** Название кнопки добавления; пустое — «Add» из словаря кита. */
    public readonly buttonTitle: InputSignal<string> = input<string>('');
    /** На телефоне выбор открывается в нижней шторке; `false` оставляет его у кнопки. */
    public readonly sheet: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /**
     * Карточки выбора в шторке: каждый пункт окна — карточка с отметкой кита справа. Включены по
     * умолчанию; `false` возвращает в шторку пункты, какими окно стоит у кнопки.
     */
    public readonly sheetCards: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /** Окно рисует карточки: оно открыто в шторке, и вход `sheetCards` их не выключил. Читает окно выбора. */
    public readonly cards: Signal<boolean> = computed((): boolean => this.sheetCards() && this.inSheet());
    /** Окно выбора открыто в нижней шторке. Читает окно выбора: его кнопки уходят в шапку шторки. */
    public readonly inSheet: Signal<boolean> = computed((): boolean =>
        this.popovers().some((popover: RtPopoverDirective): boolean => popover.openedInSheet())
    );
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
    /** Имя Material вместо `invitationIcon` — уходит во вход `glyph` заглушки приглашения. */
    public readonly invitationGlyph: InputSignal<string | null> = input<string | null>(null);
    public readonly invitationDescription: InputSignal<string> = input<string>('');
    /** Значок кнопки приглашения; null — кнопка без значка. */
    public readonly invitationButtonIcon: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(
        this.#defaults.invitationButtonIcon
    );
    /** Вид кнопки приглашения — тот же набор, что у кнопки кита. */
    public readonly invitationButtonAppearance: InputSignal<IButton.Appearance> = input<IButton.Appearance>(
        this.#defaults.invitationButtonAppearance
    );
    /** Значок кнопки «Очистить список». */
    public readonly clearIcon: InputSignal<IRtIcon.Name> = input<IRtIcon.Name>(this.#defaults.clearIcon);
    /** Название строки переносится; `false` ведёт его одной строкой с многоточием и подсказкой при обрезке. */
    public readonly titleWrap: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(this.#defaults.titleWrap, {
        transform: booleanAttribute,
    });
    /** Вид поля поиска в окне выбора. */
    public readonly searchAppearance: InputSignal<IRtInput.Appearance> = input<IRtInput.Appearance>(this.#defaults.searchAppearance);
    /** Шаг скругления поля поиска в окне выбора; null — скругление самого поля. */
    public readonly searchRadius: InputSignal<TRtRadius | null> = input<TRtRadius | null>(this.#defaults.searchRadius);
    /** Символы подписи пункта окна выбора, совпавшие со словами поиска, выделены. */
    public readonly highlightSearch: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(this.#defaults.highlightSearch, {
        transform: booleanAttribute,
    });
    /** Подпись пустого результата поиска; пустая строка оставляет подпись кита. */
    public readonly emptyResultsText: InputSignal<string> = input<string>(this.#defaults.emptyResultsText);
    /** Подпись кнопки применения в окне выбора; пустая строка оставляет подпись кита. */
    public readonly applyLabel: InputSignal<string> = input<string>(this.#defaults.applyLabel);
    /** Регистр подписи кнопки применения; `none` оставляет её как есть. */
    public readonly applyLabelCase: InputSignal<IRtDynamicSelector.LabelCase> = input<IRtDynamicSelector.LabelCase>(
        this.#defaults.applyLabelCase
    );
    /** Поле поиска получает фокус при открытии окна выбора. */
    public readonly autofocusSearch: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(this.#defaults.autofocusSearch, {
        transform: booleanAttribute,
    });
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

    constructor() {
        super();
        // Вход chosenEntities задаёт выбранное, как запись формы; эхо выбора, вернувшееся от родителя, его не трогает.
        toObservable(this.chosenEntities)
            .pipe(takeUntilDestroyed())
            .subscribe((list: TEntity[]): void => this.#takeChosen(list));
        this.#bindParts();
    }

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

    /** «Применить» в шапке шторки и ответ «Применить» на её вопрос: уходят отметки открытого окна. */
    protected onSheetApply(): void {
        if (this.pendingKeys().length > 0) {
            this.onApplied([...this.pendingKeys()]);
        }
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

    /** Окно выбора и список читают корень: его входы, вычисленное и обработчики. */
    #bindParts(): void {
        this.#parts.bindPopup({
            settings: this,
            entities: this.offered,
            apply: (keys: unknown[]): void => this.onApplied(keys),
            cancel: (): void => this.onCancelled(),
            search: (query: string): void => this.searchChange.emit(query),
            loadMore: (): void => this.loadMore.emit(),
            temporaryChoice: (entities: TEntity[]): void => this.temporaryChoiceChange.emit(entities),
            loadState: this.#loadState,
        });
        this.#parts.bindList({
            rows: this.rows,
            draggable: this.draggable,
            editable: signal<boolean>(false),
            disabled: this.isDisabled,
            actionsShown: computed((): boolean => !this.invitation()),
            resetClearShown: this.listActionsShown,
            removeShown: this.removeShown,
            resetDisabled: this.isResetDisabled,
            clearDisabled: this.isClearDisabled,
            buttonRadius: this.buttonRadius,
            clearIcon: this.clearIcon,
            titleWrap: this.titleWrap,
            titleTpl: this.titleTpl,
            controlsTpl: this.controlsTpl,
            remove: (key: unknown): void => this.onRemoved(key),
            move: (move: IRtDynamicSelector.Move): void => this.onMoved(move),
            edit: (): void => undefined,
            reset: (): void => this.onReset(),
            clear: (): void => this.onCleared(),
        });
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

    /**
     * Непустой список с другими ключами становится и значением, и исходным для сброса. Список с теми
     * же ключами в любом порядке — эхо `selectionChange` от родителя: родитель вправе вернуть его в
     * своём порядке, например каталога. Эхо не трогает ни исходный, ни порядок строк, иначе сброс не
     * включился бы.
     */
    #takeChosen(list: ReadonlyArray<TEntity>): void {
        const keys: unknown[] = list.map((item: TEntity): unknown => this.#keyOf(item));
        const shown: unknown[] = this.#entitiesOf(this.value()).map((item: TEntity): unknown => this.#keyOf(item));

        if (keys.length === 0 || sameDynamicKeySet(keys, shown)) {
            return;
        }

        this.value.set(keys);
        this.#initial.set([...keys]);
    }

    /** Запись ищется среди предложенных, а затем среди пришедших входом `chosenEntities`. */
    #entitiesOf(keys: ReadonlyArray<unknown>): TEntity[] {
        return dynamicEntitiesOf(keys, [...this.entities(), ...this.chosenEntities()], (item: TEntity): unknown => this.#keyOf(item));
    }

    /** Ключ записи — по имени поля, которое назвал вызывающий. */
    #keyOf(item: TEntity): unknown {
        return item[this.keyExp()];
    }

    /** Подпись записи — по имени поля, которое назвал вызывающий. */
    #labelOf(item: TEntity): unknown {
        const displayWith: ((entity: TEntity) => string) | null = this.displayWith();
        return displayWith === null ? item[this.displayExp()] : displayWith(item);
    }
}
