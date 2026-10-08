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
import { RtInfiniteScrollDirective } from '@rt-tools/ui-kit-v2/core';
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
    dynamicMatchParts,
    dynamicPopupRows,
    dynamicSelectAllState,
    dynamicSelectorLabel,
    dynamicSelectorMatches,
    lastPinnedDynamicKey,
    selectAllDynamicKeys,
    toggleDynamicKey,
    dynamicLabelCase,
} from '../rt-dynamic-selector.logic';
import { IRtDynamicSelector } from '../rt-dynamic-selector.model';

const BEM_BLOCK: string = 'rt-dynamic-selector-popup';

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
    host: { class: BEM_BLOCK },
})
export class RtDynamicSelectorPopupComponent<TEntity extends object> implements OnInit {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #injector: Injector = inject(Injector);
    readonly #searchSource: Subject<string> = new Subject<string>();

    protected readonly searchLabel: Signal<string> = rtKitLabel('dynamicSelectorSearch');
    protected readonly searchField: Signal<ElementRef<HTMLElement> | undefined> = viewChild('searchField', { read: ElementRef });
    protected readonly selectAllLabel: Signal<string> = rtKitLabel('uiSelectAll');
    protected readonly multiLabel: Signal<string> = rtKitLabel('dynamicSelectorMulti');
    protected readonly multiHintLabel: Signal<string> = rtKitLabel('dynamicSelectorMultiHint');
    protected readonly noResultsLabel: Signal<string> = rtKitLabel('dynamicSelectorNoResults');
    /** Подпись пустого результата: своя у приложения, иначе словарь кита. */
    protected readonly emptyText: Signal<string> = computed((): string => this.emptyResultsText() || this.noResultsLabel());
    protected readonly cancelLabel: Signal<string> = rtKitLabel('uiCancel');
    protected readonly applyKitLabel: Signal<string> = rtKitLabel('dynamicSelectorApply');
    /** Подпись кнопки применения: своя у приложения, иначе словарь кита, — в заданном регистре. */
    protected readonly applyText: Signal<string> = computed((): string =>
        dynamicLabelCase(this.applyLabel() || this.applyKitLabel(), this.applyLabelCase())
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

        if (!this.localSearch() || query.trim() === '') {
            return [...this.entities()];
        }

        return this.entities().filter((item: TEntity): boolean => {
            const label: string | null = dynamicSelectorLabel(item, (entity: TEntity): unknown => this.#labelOf(entity));

            return label !== null && dynamicSelectorMatches(label, query);
        });
    });
    protected readonly rows: Signal<IRtDynamicSelector.PopupRows<TEntity>> = computed((): IRtDynamicSelector.PopupRows<TEntity> =>
        dynamicPopupRows(this.entities(), this.found(), this.raised(), (item: TEntity): unknown => this.#keyOf(item), this.query())
    );
    protected readonly visibleKeys: Signal<unknown[]> = computed((): unknown[] =>
        [...this.rows().ticked, ...this.rows().found].map((item: TEntity): unknown => this.#keyOf(item))
    );
    /** Строки для разметки: отмеченные раньше над разделителем, найденные — под ним. */
    protected readonly rowItems: Signal<IRtDynamicSelector.PopupRow<TEntity>[]> = computed((): IRtDynamicSelector.PopupRow<TEntity>[] => {
        const ticked: ReadonlyArray<unknown> = this.ticked();
        const lastPinned: unknown = this.lastPinnedKey();
        const { ticked: above, found } = this.rows();
        const highlight: boolean = this.highlightSearch();
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
            parts: highlight ? dynamicMatchParts(labelOf(item), query) : [{ text: labelOf(item), matched: false }],
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
    protected readonly ownLabel: Signal<boolean> = computed((): boolean => !this.titleWrap() || this.highlightSearch());
    protected readonly hasRows: Signal<boolean> = computed((): boolean => this.visibleKeys().length > 0);
    protected readonly selectAllState: Signal<IRtDynamicSelector.SelectAllState> = computed((): IRtDynamicSelector.SelectAllState =>
        dynamicSelectAllState(this.visibleKeys(), this.ticked())
    );
    protected readonly isSingle: Signal<boolean> = computed((): boolean => this.mode() === 'single');
    protected readonly isSelectAllShown: Signal<boolean> = computed(
        (): boolean => !this.isSingle() && this.selectAllShown() && this.visibleKeys().length > 1 && !this.loading()
    );
    protected readonly isMultiToggleVisible: Signal<boolean> = computed(
        (): boolean => !this.isSingle() && this.multiToggleShown() && this.visibleKeys().length > 1 && !this.loading()
    );
    protected readonly lastPinnedKey: Signal<unknown> = computed((): unknown =>
        lastPinnedDynamicKey(this.rows().found, this.pinnedKeys(), (item: TEntity): unknown => this.#keyOf(item))
    );
    protected readonly isApplyDisabled: Signal<boolean> = computed((): boolean => this.ticked().length === 0 || this.loading());
    protected readonly isNavShown: Signal<boolean> = computed((): boolean => !!this.navigateTitle() && !!this.navigateLink());

    /** Предлагаемые записи: ещё не выбранные, отсортированные селектором. */
    public readonly entities: InputSignal<ReadonlyArray<TEntity>> = input<ReadonlyArray<TEntity>>([]);
    public readonly keyExp: InputSignal<keyof TEntity & string> = input.required<keyof TEntity & string>();
    public readonly displayExp: InputSignal<keyof TEntity & string> = input.required<keyof TEntity & string>();
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

    /** Применённые ключи в порядке отметок. */
    public readonly applied: OutputEmitterRef<unknown[]> = output<unknown[]>();
    public readonly cancelled: OutputEmitterRef<void> = output<void>();
    /** Запрос для поиска на сервере: через паузу после последней клавиши, стёртый — пустой строкой. */
    public readonly searchChange: OutputEmitterRef<string> = output<string>();
    public readonly loadMore: OutputEmitterRef<void> = output<void>();
    /** Отмеченные записи: пустой список при открытии и текущие отметки после каждого поиска. */
    public readonly temporaryChoiceChange: OutputEmitterRef<TEntity[]> = output<TEntity[]>();

    public ngOnInit(): void {
        // Выбор живёт в шаблоне и создаётся заново при каждом открытии: запрос начинается с входа.
        this.query.set(this.searchTerm());
        this.temporaryChoiceChange.emit([]);
        this.#searchSource
            .pipe(debounceTime(RT_DYNAMIC_SELECTOR_SEARCH_DEBOUNCE), takeUntilDestroyed(this.#destroyRef))
            .subscribe((query: string): void => this.searchChange.emit(query));

        if (this.autofocusSearch()) {
            afterNextRender((): void => this.searchField()?.nativeElement.querySelector('input')?.focus({ preventScroll: true }), {
                injector: this.#injector,
            });
        }
    }

    protected onQueryChange(value: string | null): void {
        const query: string = value ?? '';

        this.raised.set([...this.ticked()]);
        this.query.set(query);
        this.temporaryChoiceChange.emit(this.#tickedEntities());

        if (!this.localSearch()) {
            this.#searchSource.next(query);
        }
    }

    /** Нажатие строки флажков: при выключенном выборе нескольких без Ctrl или Cmd остаётся одна отметка. */
    protected onRowClick(event: MouseEvent, item: TEntity): void {
        const key: unknown = this.#keyOf(item);
        const checked: boolean = !this.ticked().includes(key);
        const addsToTicks: boolean = !this.multiToggleShown() || this.isMultiOn() || event.ctrlKey || event.metaKey;

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
            this.applied.emit([...this.ticked()]);
        }
    }

    protected onCancel(): void {
        this.cancelled.emit();
    }

    #tickedEntities(): TEntity[] {
        return this.ticked()
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
