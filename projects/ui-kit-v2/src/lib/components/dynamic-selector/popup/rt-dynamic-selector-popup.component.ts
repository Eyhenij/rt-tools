import {
    afterNextRender,
    booleanAttribute,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    Injector,
    input,
    output,
    signal,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    viewChild,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { rtKitLabel, IRtInput, TRtRadius } from '@rt-tools/ui-kit-v2/core';
import { RtInfiniteScrollDirective, RtOptionList, rtMatchParts, rtSearchMatches, TRtOptionListAction } from '@rt-tools/ui-kit-v2/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RtCheckboxComponent } from '@rt-tools/ui-kit-v2/checkbox';
import { RtEmptyStateComponent } from '@rt-tools/ui-kit-v2/empty-state';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtInputComponent } from '@rt-tools/ui-kit-v2/input';
import { RtRadioButtonComponent } from '@rt-tools/ui-kit-v2/radio-button';
import { RtSpinnerComponent } from '@rt-tools/ui-kit-v2/spinner';
import { RtToggleSwitchComponent } from '@rt-tools/ui-kit-v2/toggle-switch';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';
import {
    dynamicPopupRows,
    dynamicSelectAllState,
    dynamicSelectorLabel,
    lastPinnedDynamicKey,
    selectAllDynamicKeys,
    toggleDynamicKey,
    dynamicLabelCase,
} from '../rt-dynamic-selector.logic';
import { IRtDynamicSelector } from '../rt-dynamic-selector.model';
import { RtDynamicSelectorPartsService } from '../rt-dynamic-selector-parts.service';
import { IRtDynamicSelectorParts } from '../rt-dynamic-selector-parts.model';

const BEM_BLOCK: string = 'rt-dynamic-selector-popup';

/** Управление строки, которое держит фокус: флажок или переключатель. */
const ROW_CONTROL: string = `.${BEM_BLOCK}__row [role="checkbox"], .${BEM_BLOCK}__row [role="radio"]`;

/** Сколько ждёт поиск на сервере после последней нажатой клавиши. */
export const RT_DYNAMIC_SELECTOR_SEARCH_DEBOUNCE: number = 500;

/**
 * Всплывающий выбор динамического селектора: поиск, флажки или переключатели, «Выбрать всё»,
 * догрузка при прокрутке, «Отмена» и «Применить». Отметки живут в самом окне и уходят наружу
 * только по «Применить»: окно создаётся заново при каждом открытии, и закрытие их сбрасывает.
 */
@Component({
    selector: 'rt-dynamic-selector-popup',
    templateUrl: './rt-dynamic-selector-popup.component.html',
    styleUrls: ['./rt-dynamic-selector-popup.component.scss', './rt-dynamic-selector-popup-options.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        FormsModule,
        NgTemplateOutlet,
        RouterLink,

        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtButtonDirective,
        RtCheckboxComponent,
        RtEmptyStateComponent,
        RtIconComponent,
        RtInfiniteScrollDirective,
        RtInputComponent,
        RtRadioButtonComponent,
        RtSpinnerComponent,
        RtToggleSwitchComponent,
        RtTooltipDirective,
    ],
    host: { class: BEM_BLOCK, '(keydown)': 'onKeydown($event)' },
})
export class RtDynamicSelectorPopupComponent<TEntity extends object> implements OnInit {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #host: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #injector: Injector = inject(Injector);
    readonly #searchSource: Subject<string> = new Subject<string>();
    readonly #parts: RtDynamicSelectorPartsService<TEntity> | null = inject<RtDynamicSelectorPartsService<TEntity>>(
        RtDynamicSelectorPartsService,
        { optional: true }
    );
    /** Внутри корня окно читает его; само по себе, как кнопка приложения в своём оверлее, — свои входы. */
    readonly #standalone: boolean = !this.#parts?.hasPopup;
    readonly #source: IRtDynamicSelectorParts.PopupSource<TEntity> =
        this.#parts !== null && !this.#standalone ? this.#parts.popup : this.#ownSource();

    /**
     * Клавиши строк. Окно не называет строку через `aria-activedescendant`: строки — флажки и
     * переключатели со своими ролями, и клавиши ведут сам фокус. Enter и пробел они отмечают сами.
     */
    protected readonly optionList: RtOptionList = new RtOptionList({
        panelId: (): string => BEM_BLOCK,
        isOpen: (): boolean => false,
        count: (): number => this.rowItems().length,
        chooseKeys: new Set<string>(),
        sideKeys: false,
        edgeKeys: true,
    });

    protected readonly searchLabel: Signal<string> = rtKitLabel('dynamicSelectorSearch');
    protected readonly searchField: Signal<ElementRef<HTMLElement> | undefined> = viewChild('searchField', { read: ElementRef });
    protected readonly selectAllLabel: Signal<string> = rtKitLabel('uiSelectAll');
    protected readonly multiLabel: Signal<string> = rtKitLabel('dynamicSelectorMulti');
    protected readonly multiHintLabel: Signal<string> = rtKitLabel('dynamicSelectorMultiHint');
    protected readonly noResultsLabel: Signal<string> = rtKitLabel('dynamicSelectorNoResults');
    /** Подпись пустого результата: своя у приложения, иначе словарь кита. */
    protected readonly emptyText: Signal<string> = computed((): string => this.settings.emptyResultsText() || this.noResultsLabel());
    protected readonly cancelLabel: Signal<string> = rtKitLabel('uiCancel');
    protected readonly applyKitLabel: Signal<string> = rtKitLabel('dynamicSelectorApply');
    /** Подпись кнопки применения: своя у приложения, иначе словарь кита, — в заданном регистре. */
    protected readonly applyText: Signal<string> = computed((): string =>
        dynamicLabelCase(this.settings.applyLabel() || this.applyKitLabel(), this.settings.applyLabelCase())
    );

    /** Отмеченные ключи — ещё не применённые. */
    protected readonly ticked: WritableSignal<unknown[]> = signal<unknown[]>([]);
    /** Отметки на минуту последней смены запроса: только они стоят над разделителем, отмеченное потом — на месте. */
    protected readonly raised: WritableSignal<unknown[]> = signal<unknown[]>([]);
    protected readonly query: WritableSignal<string> = signal<string>('');
    /** Выбор нескольких включён: без него простое нажатие оставляет одну отметку. */
    protected readonly isMultiOn: WritableSignal<boolean> = signal<boolean>(false);

    /** Найденные строки: местный поиск отбирает сам, серверный отдаёт запрос наружу. */
    protected readonly found: Signal<TEntity[]> = computed((): TEntity[] => {
        const query: string = this.query();

        if (!this.settings.localSearch() || query.trim() === '') {
            return [...this.offered()];
        }

        return this.offered().filter((item: TEntity): boolean => {
            const label: string | null = dynamicSelectorLabel(item, (entity: TEntity): unknown => this.#labelOf(entity));

            return label !== null && rtSearchMatches(label, query);
        });
    });
    protected readonly rows: Signal<IRtDynamicSelector.PopupRows<TEntity>> = computed((): IRtDynamicSelector.PopupRows<TEntity> =>
        dynamicPopupRows(this.offered(), this.found(), this.raised(), (item: TEntity): unknown => this.#keyOf(item), this.query())
    );
    protected readonly visibleKeys: Signal<unknown[]> = computed((): unknown[] =>
        [...this.rows().ticked, ...this.rows().found].map((item: TEntity): unknown => this.#keyOf(item))
    );
    /** Строки для разметки: отмеченные раньше над разделителем, найденные — под ним. */
    protected readonly rowItems: Signal<IRtDynamicSelector.PopupRow<TEntity>[]> = computed((): IRtDynamicSelector.PopupRow<TEntity>[] => {
        const ticked: ReadonlyArray<unknown> = this.ticked();
        const lastPinned: unknown = this.lastPinnedKey();
        const { ticked: above, found } = this.rows();
        const highlight: boolean = this.settings.highlightSearch();
        const query: string = this.query();
        const labelOf: (item: TEntity) => string = (item: TEntity): string =>
            dynamicSelectorLabel(item, (entity: TEntity): unknown => this.#labelOf(entity)) ?? '';
        const toRow: (item: TEntity, separated: boolean) => IRtDynamicSelector.PopupRow<TEntity> = (
            item: TEntity,
            separated: boolean
        ): IRtDynamicSelector.PopupRow<TEntity> => ({
            entity: item,
            key: this.#keyOf(item),
            label: labelOf(item),
            parts: highlight ? rtMatchParts(labelOf(item), query) : [{ text: labelOf(item), matched: false }],
            ticked: ticked.includes(this.#keyOf(item)),
            separated,
        });

        return [
            ...above.map((item: TEntity, index: number): IRtDynamicSelector.PopupRow<TEntity> => toRow(item, index === above.length - 1)),
            ...found.map((item: TEntity): IRtDynamicSelector.PopupRow<TEntity> =>
                toRow(item, lastPinned !== null && this.#keyOf(item) === lastPinned)
            ),
        ];
    });
    /** Подпись выбора одной записи рисует окно, а не кнопка: без переноса и при подсветке поиска. */
    protected readonly ownLabel: Signal<boolean> = computed((): boolean => !this.settings.titleWrap() || this.settings.highlightSearch());
    protected readonly hasRows: Signal<boolean> = computed((): boolean => this.visibleKeys().length > 0);
    protected readonly selectAllState: Signal<IRtDynamicSelector.SelectAllState> = computed((): IRtDynamicSelector.SelectAllState =>
        dynamicSelectAllState(this.visibleKeys(), this.ticked())
    );
    protected readonly isSingle: Signal<boolean> = computed((): boolean => this.settings.mode() === 'single');
    protected readonly isSelectAllShown: Signal<boolean> = computed(
        (): boolean => !this.isSingle() && this.settings.selectAllShown() && this.visibleKeys().length > 1 && !this.settings.loading()
    );
    protected readonly isMultiToggleVisible: Signal<boolean> = computed(
        (): boolean => !this.isSingle() && this.settings.multiToggleShown() && this.visibleKeys().length > 1 && !this.settings.loading()
    );
    protected readonly lastPinnedKey: Signal<unknown> = computed((): unknown =>
        lastPinnedDynamicKey(this.rows().found, this.settings.pinnedKeys(), (item: TEntity): unknown => this.#keyOf(item))
    );
    protected readonly isApplyDisabled: Signal<boolean> = computed((): boolean => this.ticked().length === 0 || this.settings.loading());
    protected readonly isNavShown: Signal<boolean> = computed(
        (): boolean => !!this.settings.navigateTitle() && !!this.settings.navigateLink()
    );

    /* Внутри корня записи и настройки — его, а входы окна молчат; само по себе окно берёт свои входы. */
    protected readonly offered: Signal<ReadonlyArray<TEntity>> = this.#source.entities;
    protected readonly settings: IRtDynamicSelectorParts.PopupSettings<TEntity> = this.#source.settings;

    /** Предлагаемые записи. Внутри корня его записи важнее. */
    public readonly entities: InputSignal<ReadonlyArray<TEntity>> = input<ReadonlyArray<TEntity>>([]);
    /** Поле ключа записи; окну самому по себе оно обязательно. */
    public readonly keyExp: InputSignal<(keyof TEntity & string) | undefined> = input<(keyof TEntity & string) | undefined>(undefined);
    /** Поле подписи записи; окну самому по себе оно обязательно. */
    public readonly displayExp: InputSignal<(keyof TEntity & string) | undefined> = input<(keyof TEntity & string) | undefined>(undefined);
    /** Подпись записи для пункта и поиска; не задана — поле `displayExp`. */
    public readonly displayWith: InputSignal<((entity: TEntity) => string) | null> = input<((entity: TEntity) => string) | null>(null);
    public readonly mode: InputSignal<IRtDynamicSelector.Mode> = input<IRtDynamicSelector.Mode>('multi');
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
    public readonly pinnedKeys: InputSignal<ReadonlyArray<unknown>> = input<ReadonlyArray<unknown>>([]);
    public readonly navigateTitle: InputSignal<string> = input<string>('');
    public readonly navigateLink: InputSignal<string> = input<string>('');
    /** Запрос, с которым выбор открывается; событием поиска он не уходит — вызывающий его знает. */
    public readonly searchTerm: InputSignal<string> = input<string>('');
    /** Вид поля поиска — тот же вход, что у поля кита. */
    public readonly searchAppearance: InputSignal<IRtInput.Appearance> = input<IRtInput.Appearance>('outline');
    /** Шаг скругления поля поиска; null — скругление самого поля. */
    public readonly searchRadius: InputSignal<TRtRadius | null> = input<TRtRadius | null>(null);
    /** Подпись пустого результата поиска; пустая строка оставляет подпись кита. */
    public readonly emptyResultsText: InputSignal<string> = input<string>('');
    /** Подпись кнопки применения; пустая строка оставляет подпись кита. */
    public readonly applyLabel: InputSignal<string> = input<string>('');
    /** Регистр подписи кнопки применения; `none` оставляет её как есть. */
    public readonly applyLabelCase: InputSignal<IRtDynamicSelector.LabelCase> = input<IRtDynamicSelector.LabelCase>('none');
    /** Поле поиска получает фокус при открытии окна; по умолчанию фокус остаётся там, где был. */
    public readonly autofocusSearch: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    /** Подпись пункта переносится; `false` ведёт её одной строкой с многоточием и подсказкой при обрезке. */
    public readonly titleWrap: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /** Символы подписи пункта, совпавшие со словами поиска, выделены. */
    public readonly highlightSearch: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });

    /* События окна самого по себе; внутри корня о действиях узнаёт корень и они молчат. */
    /** Применённые ключи в порядке отметок. */
    public readonly applied: OutputEmitterRef<unknown[]> = output<unknown[]>();
    public readonly cancelled: OutputEmitterRef<void> = output<void>();
    /** Запрос для поиска на сервере: через паузу после последней клавиши, стёртый — пустой строкой. */
    public readonly searchChange: OutputEmitterRef<string> = output<string>();
    public readonly loadMore: OutputEmitterRef<void> = output<void>();
    /** Отмеченные записи: пустой список при открытии и текущие отметки после каждого поиска. */
    public readonly temporaryChoiceChange: OutputEmitterRef<TEntity[]> = output<TEntity[]>();

    public ngOnInit(): void {
        if (this.#standalone && (this.keyExp() === undefined || this.displayExp() === undefined)) {
            throw new Error('rt-dynamic-selector-popup вне корня: входы keyExp и displayExp обязательны');
        }
        // Выбор живёт в шаблоне и создаётся заново при каждом открытии: запрос начинается с входа.
        this.query.set(this.settings.searchTerm());
        this.#source.temporaryChoice([]);
        this.#searchSource
            .pipe(debounceTime(RT_DYNAMIC_SELECTOR_SEARCH_DEBOUNCE), takeUntilDestroyed(this.#destroyRef))
            .subscribe((query: string): void => this.#source.search(query));

        if (this.settings.autofocusSearch()) {
            afterNextRender((): void => this.searchField()?.nativeElement.querySelector('input')?.focus({ preventScroll: true }), {
                injector: this.#injector,
            });
        }
    }

    protected onQueryChange(value: string | null): void {
        const query: string = value ?? '';

        this.raised.set([...this.ticked()]);
        this.query.set(query);
        this.#source.temporaryChoice(this.#tickedEntities());

        if (!this.settings.localSearch()) {
            this.#searchSource.next(query);
        }
    }

    /** Нажатие строки флажков: при выключенном выборе нескольких без Ctrl или Cmd остаётся одна отметка. */
    protected onRowClick(event: MouseEvent, item: TEntity): void {
        const key: unknown = this.#keyOf(item);
        const checked: boolean = !this.ticked().includes(key);
        const addsToTicks: boolean = !this.settings.multiToggleShown() || this.isMultiOn() || event.ctrlKey || event.metaKey;

        this.ticked.update((keys: unknown[]): unknown[] => toggleDynamicKey(addsToTicks ? keys : [], key, checked));
    }

    protected onRadioChange(item: TEntity): void {
        this.ticked.set([this.#keyOf(item)]);
    }

    protected onSelectAll(checked: boolean): void {
        this.ticked.update((keys: unknown[]): unknown[] => selectAllDynamicKeys(this.visibleKeys(), keys, checked));
    }

    protected onMultiToggle(value: boolean): void {
        this.isMultiOn.set(value);
    }

    protected onApply(): void {
        if (!this.isApplyDisabled()) {
            this.#source.apply([...this.ticked()]);
        }
    }

    protected onCancel(): void {
        this.#source.cancel();
    }

    protected onLoadMore(): void {
        this.#source.loadMore();
    }

    /** Стрелки, Home и End ведут фокус по строкам; в поле поиска Home и End остаются у курсора. */
    protected onKeydown(event: KeyboardEvent): void {
        const target: EventTarget | null = event.target;
        if (!(target instanceof Node)) {
            return;
        }
        const controls: HTMLElement[] = Array.from(this.#host.nativeElement.querySelectorAll<HTMLElement>(ROW_CONTROL));
        const index: number = controls.findIndex((control: HTMLElement): boolean => control.contains(target));
        const inSearch: boolean = this.searchField()?.nativeElement.contains(target) ?? false;
        if (controls.length === 0 || (index < 0 && !inSearch)) {
            return;
        }
        this.optionList.activeIndex.set(index);
        if (this.#moveBy(this.optionList.actionOf(event.key), inSearch)) {
            event.preventDefault();
            controls[this.optionList.activeIndex()]?.focus();
        }
    }

    /** Сдвигает строку по действию клавиши; `false` — клавиша не строк. */
    #moveBy(action: TRtOptionListAction, inSearch: boolean): boolean {
        switch (action) {
            case 'next':
                this.optionList.move(1);
                return true;
            case 'previous':
                if (inSearch) {
                    this.optionList.last();
                } else {
                    this.optionList.move(-1);
                }
                return true;
            case 'first':
            case 'last':
                if (inSearch) {
                    return false;
                }
                if (action === 'first') {
                    this.optionList.first();
                } else {
                    this.optionList.last();
                }
                return true;
            default:
                return false;
        }
    }

    /** Источник окна самого по себе: входы и события. Сигналы читают входы лениво — те объявлены ниже. */
    #ownSource(): IRtDynamicSelectorParts.PopupSource<TEntity> {
        return {
            entities: computed((): ReadonlyArray<TEntity> => this.entities()),
            settings: {
                keyExp: computed((): keyof TEntity & string => this.keyExp() as keyof TEntity & string),
                displayExp: computed((): keyof TEntity & string => this.displayExp() as keyof TEntity & string),
                displayWith: computed((): ((entity: TEntity) => string) | null => this.displayWith()),
                mode: computed((): IRtDynamicSelector.Mode => this.mode()),
                multiToggleShown: computed((): boolean => this.multiToggleShown()),
                selectAllShown: computed((): boolean => this.selectAllShown()),
                localSearch: computed((): boolean => this.localSearch()),
                lazyLoad: computed((): boolean => this.lazyLoad()),
                loading: computed((): boolean => this.loading()),
                fetching: computed((): boolean => this.fetching()),
                pinnedKeys: computed((): ReadonlyArray<unknown> => this.pinnedKeys()),
                navigateTitle: computed((): string => this.navigateTitle()),
                navigateLink: computed((): string => this.navigateLink()),
                searchTerm: computed((): string => this.searchTerm()),
                searchAppearance: computed((): IRtInput.Appearance => this.searchAppearance()),
                searchRadius: computed((): TRtRadius | null => this.searchRadius()),
                emptyResultsText: computed((): string => this.emptyResultsText()),
                applyLabel: computed((): string => this.applyLabel()),
                applyLabelCase: computed((): IRtDynamicSelector.LabelCase => this.applyLabelCase()),
                autofocusSearch: computed((): boolean => this.autofocusSearch()),
                titleWrap: computed((): boolean => this.titleWrap()),
                highlightSearch: computed((): boolean => this.highlightSearch()),
            },
            apply: (keys: unknown[]): void => this.applied.emit(keys),
            cancel: (): void => this.cancelled.emit(),
            search: (query: string): void => this.searchChange.emit(query),
            loadMore: (): void => this.loadMore.emit(),
            temporaryChoice: (entities: TEntity[]): void => this.temporaryChoiceChange.emit(entities),
        };
    }

    #tickedEntities(): TEntity[] {
        return this.ticked()
            .map((key: unknown): TEntity | undefined => this.offered().find((item: TEntity): boolean => this.#keyOf(item) === key))
            .filter((item: TEntity | undefined): item is TEntity => item !== undefined);
    }

    /** Ключ записи — по имени поля, которое назвал вызывающий. */
    #keyOf(item: TEntity): unknown {
        return item[this.settings.keyExp()];
    }

    /** Подпись записи — по имени поля, которое назвал вызывающий. */
    #labelOf(item: TEntity): unknown {
        const displayWith: ((entity: TEntity) => string) | null = this.settings.displayWith();

        return displayWith === null ? item[this.settings.displayExp()] : displayWith(item);
    }
}
