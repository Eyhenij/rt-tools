import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
    CDK_TABLE,
    CdkCell,
    CdkCellDef,
    CdkColumnDef,
    CdkHeaderCell,
    CdkHeaderCellDef,
    CdkTable,
    CdkTableDataSourceInput,
    DataRowOutlet,
    FooterRowOutlet,
    HeaderRowOutlet,
    NoDataRowOutlet,
} from '@angular/cdk/table';
import { NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    contentChildren,
    DestroyRef,
    ElementRef,
    forwardRef,
    inject,
    Injector,
    input,
    InputSignal,
    InputSignalWithTransform,
    linkedSignal,
    numberAttribute,
    output,
    OutputEmitterRef,
    signal,
    Signal,
    TemplateRef,
    ViewChild,
    WritableSignal,
    ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BlockDirective, ElemDirective, ModDirective, WINDOW } from '@rt-tools/core';
import { IFilterModel, ISortModel } from '@rt-tools/utils';

import { TRtKitLabelKey, rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { BreakpointsService } from '@rt-tools/ui-kit-v2/core';

import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { IRtLoadError, RtEmptyStateComponent, rtLoadErrorView } from '@rt-tools/ui-kit-v2/empty-state';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { RtMenuComponent } from '@rt-tools/ui-kit-v2/menu';
import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';
import { RtSkeletonComponent } from '@rt-tools/ui-kit-v2/skeleton';
import { RtSpinnerComponent } from '@rt-tools/ui-kit-v2/spinner';
import { RtTableFilterHeaderComponent } from './filter-header/rt-table-filter-header.component';
import { RtTableCardDirective } from './rt-table-card.directive';
import { cardColumnsOf, cardRowsOf, hasRowsIn, IRtTableCardColumn } from './rt-table-cards.logic';
import { RtTableCardActivationDirective } from './rt-table-card-activation.directive';
import { RtTableRowActionsDirective } from './rt-table-row-actions.directive';
import { RtTableEmptyStateDirective, RtTableErrorDirective } from './rt-table-states.directive';
import { RtRowHasActionsPipe } from './rt-table-row-actions.pipe';
import { RtTableColumnSettings } from './rt-table-column-settings';
import { displayedColumnKeys } from './rt-table-columns.logic';
import { filterCellsOf } from './rt-table-filter.logic';
import { IRtTablePinnedEdges, RtTablePinnedEdges } from './rt-table-pinned-edges';
import { nextSort } from './rt-table-sort.logic';
import { IRtTable } from './rt-table.model';

const BEM_BLOCK: string = 'rt-table';

const DEFAULT_SKELETON_ROWS: number = 5;
/** Ключ подписи пустой таблицы: язык известен только после старта приложения */
const DEFAULT_EMPTY_KEY: TRtKitLabelKey = 'uiNoRows';

/**
 * Таблица — стилизованная обёртка над `cdk-table` (`@angular/cdk/table`).
 *
 * Селектор работает и как element (`<rt-table>`), и как attribute на native `<table rt-table>`.
 * Native-вариант предпочтительнее — даёт правильную table-семантику для скрин-ридеров, но
 * наложения загрузки, пустого места и заглушек требуют element-варианта: `<div>` не валиден как
 * ребёнок `<table>`.
 *
 * Какие состояния таблица различает и чем рисует каждое — в заметке семьи рядом, `CONTEXT.md`.
 */
@Component({
    selector: 'rt-table, table[rt-table]',
    exportAs: 'rtTable',
    templateUrl: './rt-table.component.html',
    styleUrl: './rt-table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // @angular/cdk
        CdkCell,
        CdkCellDef,
        CdkColumnDef,
        CdkHeaderCell,
        CdkHeaderCellDef,
        DataRowOutlet,
        FooterRowOutlet,
        HeaderRowOutlet,
        NoDataRowOutlet,

        // @angular/common
        NgTemplateOutlet,

        // standalone components / directives
        RtButtonDirective,
        RtEmptyStateComponent,
        RtMenuComponent,
        RtSkeletonComponent,
        RtSpinnerComponent,
        RtTableFilterHeaderComponent,
        RtTableCardActivationDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,

        // pipes
        RtRowHasActionsPipe,
    ],
    hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
    providers: [
        {
            provide: CDK_TABLE,
            useExisting: forwardRef((): typeof RtTableComponent => RtTableComponent),
        },
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-table--density--compact]': "density() === 'compact'",
        '[class.rt-table--clickable]': 'clickable()',
        '[class.rt-table--loading]': 'isInitialLoading()',
        '[class.rt-table--fetching]': 'fetching()',
        '[class.rt-table--empty]': 'isEmpty()',
        '[class.rt-table--error]': 'loadError.shown()',
        '[class.rt-table--cards]': 'showCards()',
        '[class.rt-table--hidden-start]': 'hiddenEdges().start',
        '[class.rt-table--hidden-end]': 'hiddenEdges().end',
        '[attr.role]': 'hostRole',
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.aria-busy]': "isInitialLoading() || fetching() ? 'true' : null",
    },
})
export class RtTableComponent<TRow> extends CdkTable<TRow> {
    readonly #t_uiNoRows: Signal<string> = rtKitLabel(DEFAULT_EMPTY_KEY);

    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #breakpoints: BreakpointsService = inject(BreakpointsService);
    readonly #injector: Injector = inject(Injector);
    readonly #host: HTMLElement = inject(ElementRef).nativeElement as HTMLElement;
    readonly #window: Window = inject(WINDOW);

    readonly #dataSourceVersion: WritableSignal<number> = signal<number>(0);

    /** Под какой закреплённой колонкой есть прокрученное содержимое — по нему видна тень у края. */
    readonly #hiddenEdges: WritableSignal<IRtTablePinnedEdges> = signal<IRtTablePinnedEdges>(
        { start: false, end: false },
        { equal: (a: IRtTablePinnedEdges, b: IRtTablePinnedEdges): boolean => a.start === b.start && a.end === b.end }
    );

    /** Следит за прокруткой контейнера потребителя: таблица сама вбок не прокручивается. */
    readonly #pinnedEdges: RtTablePinnedEdges = new RtTablePinnedEdges((edges: IRtTablePinnedEdges): void => this.#hiddenEdges.set(edges));

    /**
     * Выбранная сортировка. Заводится от входа `[sort]` и переключается заголовками:
     * таблица показывает порядок и без потребителя, который его слушает.
     */
    readonly #sort: WritableSignal<ISortModel<string> | null> = linkedSignal<ISortModel<string> | null>((): ISortModel<string> | null =>
        this.sort()
    );

    /** Настройка колонок: применённые настройки, реестр панели, загрузка и запись. */
    readonly #columnSettings: RtTableColumnSettings = new RtTableColumnSettings(
        (): ReadonlyArray<IRtTable.ColumnConfig> => this.columnsConfig(),
        (): string | null => this.tableId()
    );

    /** Колонка действий и её ячейки: регистрируются в CdkTable вручную — почему, сказано в `CONTEXT.md`. */
    // native-ok: сигнальный viewChild() резолвится после первой отрисовки строк, а колонка действий должна попасть в реестр CdkTable до неё
    @ViewChild(CdkColumnDef, { static: true })
    private readonly actionsColumnDef?: CdkColumnDef;

    // native-ok: то же, что у объявления колонки выше: def присваивается вручную в ngOnInit, до первой отрисовки
    @ViewChild(CdkCellDef, { static: true })
    private readonly actionsCellDef?: CdkCellDef;

    // native-ok: то же, что у объявления колонки выше: def присваивается вручную в ngOnInit, до первой отрисовки
    @ViewChild(CdkHeaderCellDef, { static: true })
    private readonly actionsHeaderCellDef?: CdkHeaderCellDef;

    /**
     * Роль хоста: у native `<table rt-table>` она есть от самого тега, а элементному
     * `<rt-table>` её ставим сами. Без неё скрин-ридер читает список строками текста: роли
     * строк и ячеек CDK проставляет сам, а роли самой таблицы у него нет, и проставленные
     * остаются висеть вне таблицы. Считается один раз — тег хоста по ходу жизни не меняется.
     */
    protected readonly hostRole: 'table' | null = (inject(ElementRef).nativeElement as HTMLElement).tagName === 'RT-TABLE' ? 'table' : null;

    /** Скрытые края для модификаторов хоста `--hidden-start` и `--hidden-end`. */
    protected readonly hiddenEdges: Signal<IRtTablePinnedEdges> = this.#hiddenEdges.asReadonly();

    /** `true` когда initial-load в полёте и entities ещё нет — skeleton rows; при `error` их нет. */
    protected readonly isInitialLoading: Signal<boolean> = computed(
        (): boolean => this.error() === null && this.loading() && this.#hasData() === false
    );

    /** `true` когда загрузка завершена и entities пустые — рендерим empty placeholder. */
    protected readonly isEmpty: Signal<boolean> = computed(
        (): boolean => this.error() === null && !this.loading() && !this.fetching() && this.#hasData() === false
    );

    /** Вид ошибки загрузки: заголовок, подсказка и контекст своего шаблона; ошибка важнее загрузки и пустоты. */
    protected readonly loadError: IRtLoadError.View = rtLoadErrorView(
        () => this.error(),
        () => this.errorDescription(),
        () => this.retry.emit()
    );

    /** Подпись кнопки повтора загрузки. */
    protected readonly retryLabel: Signal<string> = rtKitLabel('uiRetry');

    /** Свой вид пустой таблицы директивой (`<ng-template rtTableEmpty>` или `rtTableEmptyState`). */
    protected readonly emptyStateTemplate: Signal<RtTableEmptyStateDirective | undefined> = contentChild(RtTableEmptyStateDirective);

    /** Свой вид ошибки загрузки (`<ng-template rtTableError>`). */
    protected readonly errorTemplate: Signal<RtTableErrorDirective | undefined> = contentChild(RtTableErrorDirective);

    /** Шаблон пустой таблицы: директива важнее прежней ссылки `#rtTableEmpty`. */
    protected readonly emptyView: Signal<TemplateRef<unknown> | undefined> = computed(
        (): TemplateRef<unknown> | undefined => this.emptyStateTemplate()?.templateRef ?? this.emptyTemplate()
    );

    /** Массив для `@for` — числа от 0 до skeletonRows-1, рендерим placeholder-rows. */
    protected readonly skeletonRowIndexes: Signal<ReadonlyArray<number>> = computed((): ReadonlyArray<number> =>
        Array.from({ length: this.skeletonRows() }, (_: unknown, i: number) => i)
    );

    /** Шаблон содержимого «…»-меню действий строки (`<ng-template rtTableRowActions>`). */
    protected readonly rowActions: Signal<RtTableRowActionsDirective | undefined> = contentChild(RtTableRowActionsDirective);

    /** Кастомный шаблон карточки мобильного режима (`<ng-template rtTableCard>`). Опционален. */
    protected readonly cardTemplate: Signal<RtTableCardDirective | undefined> = contentChild(RtTableCardDirective);

    /**
     * Все проецируемые потребителем `cdkColumnDef` — источник cell-шаблонов для
     * авто-карточек. «…»-колонка действий объявлена во view rt-table, поэтому в
     * этот content-query не попадает.
     */
    protected readonly columnDefs: Signal<ReadonlyArray<CdkColumnDef>> = contentChildren(CdkColumnDef, { descendants: true });

    /** Узкий вьюпорт (≤1080px): таблица прячется, строки рендерятся карточками. */
    protected readonly isNarrow: Signal<boolean> = this.#breakpoints.narrow;

    /** Карточки показываются только когда card-режим включён (`[cards]`) и экран узкий. */
    protected readonly showCards: Signal<boolean> = computed((): boolean => this.cards() && this.isNarrow());

    /**
     * Строки для карточек узкого экрана. Признак `#dataSourceVersion` пересчитывает список
     * при смене источника: CDK хранит его полем, а не сигналом.
     */
    protected readonly cardRows: Signal<ReadonlyArray<TRow>> = computed((): ReadonlyArray<TRow> => {
        this.#dataSourceVersion();

        return cardRowsOf<TRow>(this.dataSource);
    });

    /** Поля авто-карточки узкого экрана: видимые колонки с подписью и шаблоном ячейки. */
    protected readonly cardColumns: Signal<ReadonlyArray<IRtTableCardColumn<TRow>>> = computed(
        (): ReadonlyArray<IRtTableCardColumn<TRow>> => cardColumnsOf<TRow>(this.displayedColumns(), this.columnDefs(), this.columnsConfig())
    );

    /** ContentChild template для кастом empty-placeholder'а. Опционален; fallback — emptyMessage. */
    public readonly emptyTemplate: Signal<TemplateRef<unknown> | undefined> = contentChild('rtTableEmpty', { read: TemplateRef });

    /** ARIA-label корневого `<table>` (или `<rt-table>` элемента). */
    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    /** Плотность: `"compact"` уменьшает padding и высоту ячеек. */
    public readonly density: InputSignal<IRtTable.Density> = input<IRtTable.Density>('default');

    /**
     * Мобильный card-режим на узком экране (≤1080px): таблица рендерится списком
     * карточек «поле: значение». Включён по умолчанию для всех списков. Отключать
     * (`[cards]="false"`) для не-списочных таблиц — например, key-value quote-таблицы
     * внутри асайда, где карточки дублируют смысл.
     */
    public readonly cards: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    /**
     * Строки кликабельны (открывают деталь/асайд). Включает визуальный аффорданс
     * (cursor/focus-ring); саму активацию + a11y обеспечивает директива
     * `rtTableRow` на `<tr cdk-row>`.
     */
    public readonly clickable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Initial-load в полёте. При `true` + пустых entities рендерит skeleton rows. */
    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Re-fetch в полёте. При `true` рисует sticky overlay c rt-spinner поверх существующих rows. */
    public readonly fetching: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Имена колонок (тот же массив что в `*cdkRowDef columns: ...`). Нужен для skeleton row layout. */
    public readonly columns: InputSignal<ReadonlyArray<string>> = input<ReadonlyArray<string>>([]);

    /**
     * Метаданные колонок для настраиваемой таблицы: `[{key,label,hidden?,locked?}]`.
     * Когда задан — `displayedColumns()` вычисляется из него с учётом настроек
     * (видимость + порядок), а таблица получает панель настроек (при заданном `[tableId]`).
     * Пуст — таблица работает по legacy `[columns]` без панели.
     */
    public readonly columnsConfig: InputSignal<ReadonlyArray<IRtTable.ColumnConfig>> = input<ReadonlyArray<IRtTable.ColumnConfig>>([]);

    /**
     * Идентификатор таблицы для персиста настроек колонок (ключ в IndexedDB).
     * Без него панель настроек недоступна (`canConfigure()` = false).
     */
    public readonly tableId: InputSignal<string | null> = input<string | null>(null);

    /**
     * Добавляет в конец строки «…»-колонку действий (`rt-menu`). Содержимое меню —
     * через `<ng-template rtTableRowActions let-row>`; колонку нужно подключить
     * в row-def'ах через `displayedColumns()`.
     */
    public readonly showRowActions: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Есть ли у строки доступные действия. Строка, которой нельзя сделать ничего,
     * кнопки «…» не показывает вовсе. Экран заполняет тем же признаком, которым
     * гейтит пункты меню; `null` — у всех строк действия есть.
     */
    public readonly rowHasActions: InputSignal<IRtTable.RowActionsPredicate<TRow> | null> =
        input<IRtTable.RowActionsPredicate<TRow> | null>(null);

    /**
     * Показывать ли строку отбора под шапкой. Таблица с отбором в настройке колонок не
     * становится таблицей с полями над строками сама: вторая строка шапки стоит высоты
     * экрана, и платить за неё решает потребитель.
     */
    public readonly showFilters: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Набор условий, по которому нарисованы ячейки отбора. Держит его потребитель. */
    public readonly filters: InputSignal<ReadonlyArray<IFilterModel<string>>> = input<ReadonlyArray<IFilterModel<string>>>([]);

    /** Набор условий изменился. Строки сужает потребитель — таблица только сообщает. */
    public readonly filtersChange: OutputEmitterRef<ReadonlyArray<IFilterModel<string>>> = output<ReadonlyArray<IFilterModel<string>>>();

    /** Выбранная сортировка: `null` — порядок задаёт источник данных. */
    public readonly sort: InputSignal<ISortModel<string> | null> = input<ISortModel<string> | null>(null);

    /** Пользователь переключил порядок заголовком. Саму выборку делает потребитель. */
    public readonly sortChange: OutputEmitterRef<ISortModel<string> | null> = output<ISortModel<string> | null>();

    /** Нажата «Повторить» на ошибке загрузки. Саму загрузку делает потребитель. */
    public readonly retry: OutputEmitterRef<void> = output<void>();

    /** Текущая сортировка — её читают заголовки колонок (`rtSortHeader`). */
    public readonly currentSort: Signal<ISortModel<string> | null> = this.#sort.asReadonly();

    /**
     * Разрешённые колонки настраиваемой таблицы: `[columnsConfig]` в применённом
     * порядке, с текущим флагом `hidden` (locked всегда видимы). Панель настроек
     * читает этот список для отрисовки; из него же строится `displayedColumns()`.
     * Пустой при отсутствии `[columnsConfig]` (legacy-режим).
     */
    public readonly resolvedColumns: Signal<ReadonlyArray<IRtTable.ColumnSettingItem>> = computed(
        (): ReadonlyArray<IRtTable.ColumnSettingItem> => this.#columnSettings.resolved()
    );

    /**
     * Колонки для `*cdkHeaderRowDef`/`*cdkRowDef`. При заданном `[columnsConfig]` —
     * видимые колонки в применённом порядке; иначе — legacy `[columns]`. Плюс
     * «…»-колонка действий в конце при `[showRowActions]`. Потребитель читает через
     * template-ref: `<rt-table #t="rtTable" ...>` →
     * `*cdkRowDef="let row; columns: t.displayedColumns()"`.
     */
    public readonly displayedColumns: Signal<ReadonlyArray<string>> = computed((): ReadonlyArray<string> =>
        displayedColumnKeys(this.resolvedColumns(), this.columns(), this.columnsConfig().length > 0, this.showRowActions())
    );

    /**
     * Ячейки строки отбора: по ячейке на каждую показанную колонку, в том же порядке. У
     * колонки без объявленного отбора ячейка пустая, но своё место держит — иначе ячейки
     * съезжают на соседние колонки. Колонка действий строки попадает сюда тем же путём:
     * `displayedColumns()` уже несёт её последней.
     */
    public readonly filterCells: Signal<ReadonlyArray<IRtTable.FilterCell>> = computed((): ReadonlyArray<IRtTable.FilterCell> =>
        filterCellsOf(this.displayedColumns(), this.columnsConfig())
    );

    /** `true` когда таблица настраиваемая: есть и `[columnsConfig]`, и `[tableId]`. */
    public readonly canConfigure: Signal<boolean> = this.#columnSettings.canConfigure;

    /** Сколько skeleton-строк рендерить во время initial-load. Default 5. */
    public readonly skeletonRows: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(DEFAULT_SKELETON_ROWS, {
        transform: numberAttribute,
    });

    /** Подпись пустой таблицы; пусто — берётся переведённое умолчание. */
    public readonly emptyMessage: InputSignal<string> = input<string>('');

    /** Своя подпись пустой таблицы важнее умолчания */
    public readonly emptyText: Signal<string> = computed((): string => this.emptyMessage() || this.#t_uiNoRows());

    /** Иконка дефолтного empty-placeholder'а (rt-empty-state). `null` — без иконки. */
    public readonly emptyIcon: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>('inbox');

    /** Описание под заголовком дефолтного empty-placeholder'а. Опционально. */
    public readonly emptyDescription: InputSignal<string | null> = input<string | null>(null);

    /** Ошибка загрузки: не `null` — заглушка ошибки вместо строк. Пустая строка — подпись кита. */
    public readonly error: InputSignal<string | null> = input<string | null>(null);

    /** Подсказка под ошибкой; пустая — подпись кита. */
    public readonly errorDescription: InputSignal<string> = input<string>('');

    public override ngOnInit(): void {
        super.ngOnInit();
        // Регистрируем view-колонку действий до первого рендера строк, чтобы
        // `displayedColumns()` мог на неё ссылаться без «column not found».
        // Cell/header присваиваем вручную — их ContentChild ещё не отработал.
        if (this.actionsColumnDef !== undefined && this.actionsCellDef !== undefined && this.actionsHeaderCellDef !== undefined) {
            this.actionsColumnDef.cell = this.actionsCellDef;
            this.actionsColumnDef.headerCell = this.actionsHeaderCellDef;
            this.addColumnDef(this.actionsColumnDef);
        }

        this.#columnSettings.start();
        afterNextRender((): void => this.#pinnedEdges.watch(this.#host, this.#window), { injector: this.#injector });
        this.#columnSettings
            .saved()
            .pipe(takeUntilDestroyed(this.#destroyRef))
            .subscribe((settings: IRtTable.ColumnSettings): void => this.applyColumnSettings(settings));
    }

    public override ngOnDestroy(): void {
        if (this.actionsColumnDef !== undefined) {
            this.removeColumnDef(this.actionsColumnDef);
        }
        this.#columnSettings.stop();
        this.#pinnedEdges.stop();
        super.ngOnDestroy();
    }

    /**
     * Переключает порядок по колонке: по возрастанию → по убыванию → без сортировки.
     * Выбранное состояние уходит наружу — выборку делает потребитель.
     */
    public toggleSort(propertyName: string): void {
        const selected: ISortModel<string> | null = nextSort(this.#sort(), propertyName);
        this.#sort.set(selected);
        this.sortChange.emit(selected);
    }

    /** Ячейка отбора сообщила новый набор условий — таблица отдаёт его наружу целиком. */
    public reportFilters(filters: ReadonlyArray<IFilterModel<string>>): void {
        this.filtersChange.emit(filters);
    }

    public applyColumnSettings(settings: IRtTable.ColumnSettings): void {
        this.#columnSettings.apply(settings);
    }

    /**
     * Пробрасывает `dataSource` в CdkTable и отдельно инвалидирует signals,
     * которые вычисляют loading/empty-состояния по plain CDK input.
     */
    public override set dataSource(dataSource: CdkTableDataSourceInput<TRow>) {
        super.dataSource = dataSource;
        this.#dataSourceVersion.update((version: number): number => version + 1);
    }

    /** Возвращает текущий источник данных, сохранённый базовым CdkTable. */
    public override get dataSource(): CdkTableDataSourceInput<TRow> {
        return super.dataSource;
    }

    /** Есть ли строки в `dataSource`; признак версии пересчитывает ответ при смене источника. */
    #hasData(): boolean {
        this.#dataSourceVersion();
        return hasRowsIn(this.dataSource);
    }
}
