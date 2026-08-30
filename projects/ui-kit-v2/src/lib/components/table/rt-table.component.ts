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

import { BlockDirective, ElemDirective, IDBStorageService, ModDirective } from '@rt-tools/core';
import { ISortModel } from '@rt-tools/utils';

import { TRtKitLabelKey, rtKitLabel } from '../../i18n';
import { BreakpointsService } from '../../platform';

import { RtEmptyStateComponent } from '../empty-state/rt-empty-state.component';
import { IRtIcon } from '../icon/rt-icon.model';
import { RtMenuComponent } from '../menu/rt-menu.component';
import { RtSkeletonComponent } from '../skeleton/rt-skeleton.component';
import { RtSpinnerComponent } from '../spinner/rt-spinner.component';
import { RtTableCardDirective } from './rt-table-card.directive';
import { cardColumnsOf, cardRowsOf, IRtTableCardColumn } from './rt-table-cards.logic';
import { RtTableRowActionsDirective } from './rt-table-row-actions.directive';
import { RtRowHasActionsPipe } from './rt-table-row-actions.pipe';
import { RtTableSettingsPersistence } from './rt-table-settings.persistence';
import { RtTableSettingsRegistry, type IRtTableSettingsRegistration } from './rt-table-settings.registry';
import { defaultColumnItems, displayedColumnKeys, resolveColumns, withoutLockedHidden } from './rt-table-columns.logic';
import { nextSort } from './rt-table-sort.logic';
import { IRtTable } from './rt-table.model';

const BEM_BLOCK: string = 'rt-table';

const DEFAULT_SKELETON_ROWS: number = 5;
/** Ключ подписи пустой таблицы: язык известен только после старта приложения */
const DEFAULT_EMPTY_KEY: TRtKitLabelKey = 'uiNoRows';

export { RT_TABLE_ROW_ACTIONS_COLUMN } from './rt-table-columns.logic';

/**
 * Таблица — стилизованная обёртка над `cdk-table` (`@angular/cdk/table`).
 *
 * Селектор работает и как element (`<rt-table>`), и как attribute на native
 * `<table rt-table>`. Native-вариант предпочтительнее — даёт правильную
 * table-семантику для скрин-ридеров. Loading/empty/skeleton overlays
 * требуют `<rt-table>` element selector (overlay-divs не валидны как дети
 * `<table>`).
 *
 * Состояния рендера (по комбинации `[loading]` + `[fetching]` + `dataSource.length`):
 *
 * - `loading && data=[]`     → header row + N skeleton `<tr>` (по `[columns]`).
 * - `fetching && data=[...]` → existing rows + sticky overlay с rt-spinner поверх.
 * - `!loading && !fetching && data=[]` → empty placeholder (ContentChild
 *   `#rtTableEmpty` template или default `<rt-empty-state>` по `emptyMessage`/`emptyIcon`).
 * - `!loading && !fetching && data=[...]` → обычный рендер CDK row-outlet'ов.
 *
 * Sticky overlay использует `position: sticky` относительно ближайшего
 * scroll-container ancestor'а (обычно page-level `rtElem="table-scroll"` wrapper).
 * Spinner внутри overlay flex-центрирован → всегда в middle viewport.
 *
 * Skeleton rows читают `[columns]` input — массив имён колонок (тот же что в
 * `*cdkRowDef="let row; columns: ..."`). Auto-detect через CDK internals не
 * используется — explicit input проще и testable.
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
        RtEmptyStateComponent,
        RtMenuComponent,
        RtSkeletonComponent,
        RtSpinnerComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,

        // pipes
        RtRowHasActionsPipe,
    ],
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
        '[class.rt-table--cards]': 'showCards()',
        '[attr.role]': 'hostRole',
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.aria-busy]': "isInitialLoading() || fetching() ? 'true' : null",
    },
})
export class RtTableComponent<TRow> extends CdkTable<TRow> {
    readonly #t_uiNoRows: Signal<string> = rtKitLabel(DEFAULT_EMPTY_KEY);

    readonly #registry: RtTableSettingsRegistry = inject(RtTableSettingsRegistry);
    readonly #settings: RtTableSettingsPersistence = new RtTableSettingsPersistence(
        inject<IDBStorageService<IRtTable.ColumnSettings>>(IDBStorageService),
        inject(DestroyRef)
    );
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #breakpoints: BreakpointsService = inject(BreakpointsService);

    readonly #dataSourceVersion: WritableSignal<number> = signal<number>(0);

    /**
     * Выбранная сортировка. Заводится от входа `[sort]` и переключается заголовками:
     * таблица показывает порядок и без потребителя, который его слушает.
     */
    readonly #sort: WritableSignal<ISortModel<string> | null> = linkedSignal<ISortModel<string> | null>((): ISortModel<string> | null =>
        this.sort()
    );

    /** Настройки колонок, применённые поверх `[columnsConfig]`; `null` — умолчания конфига. */
    readonly #columnSettings: WritableSignal<IRtTable.ColumnSettings | null> = signal<IRtTable.ColumnSettings | null>(null);

    /** Колонки конфига без настроек пользователя — с них панель начинает после сброса. */
    readonly #defaultColumns: Signal<ReadonlyArray<IRtTable.ColumnSettingItem>> = computed((): ReadonlyArray<IRtTable.ColumnSettingItem> =>
        defaultColumnItems(this.columnsConfig())
    );

    /** tableId для персиста настроек (ключ порта). `null` — таблица не настраиваемая (нет tableId/config). */
    readonly #persistableTableId: Signal<string | null> = computed((): string | null => {
        const id: string | null = this.tableId();
        return id !== null && this.columnsConfig().length > 0 ? id : null;
    });

    /**
     * Внутренняя «…»-колонка действий объявлена в шаблоне rt-table (view) и
     * регистрируется в CdkTable вручную (`addColumnDef`) в `ngOnInit` — так же,
     * как это делает CDK-шный `CdkTextColumn`. Статический `@ViewChild` нужен,
     * чтобы колонка попала в реестр ДО первого рендера строк (signal-query
     * резолвится слишком поздно). Не `#private`: декоратор требует ключевое
     * слово `private`.
     */
    // native-ok: сигнальный viewChild() резолвится после первой отрисовки строк, а колонка действий должна попасть в реестр CdkTable до неё
    @ViewChild(CdkColumnDef, { static: true })
    private readonly actionsColumnDef?: CdkColumnDef;

    /**
     * Cell/header-def'ы «…»-колонки. Присваиваем их `columnDef` вручную в
     * `ngOnInit` (как `CdkTextColumn`), потому что собственный ContentChild
     * `CdkColumnDef` ещё не отработал к моменту первого рендера view-колонки —
     * без ручного присвоения CdkTable падает на `extractCellTemplate`.
     */
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

    /** `true` когда initial-load в полёте и entities ещё нет — рендерим skeleton rows. */
    protected readonly isInitialLoading: Signal<boolean> = computed((): boolean => this.loading() && this.#hasData() === false);

    /** `true` когда загрузка завершена и entities пустые — рендерим empty placeholder. */
    protected readonly isEmpty: Signal<boolean> = computed((): boolean => !this.loading() && !this.fetching() && this.#hasData() === false);

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

    /** Выбранная сортировка: `null` — порядок задаёт источник данных. */
    public readonly sort: InputSignal<ISortModel<string> | null> = input<ISortModel<string> | null>(null);

    /** Пользователь переключил порядок заголовком. Саму выборку делает потребитель. */
    public readonly sortChange: OutputEmitterRef<ISortModel<string> | null> = output<ISortModel<string> | null>();

    /** Текущая сортировка — её читают заголовки колонок (`rtSortHeader`). */
    public readonly currentSort: Signal<ISortModel<string> | null> = this.#sort.asReadonly();

    /**
     * Разрешённые колонки настраиваемой таблицы: `[columnsConfig]` в применённом
     * порядке, с текущим флагом `hidden` (locked всегда видимы). Панель настроек
     * читает этот список для отрисовки; из него же строится `displayedColumns()`.
     * Пустой при отсутствии `[columnsConfig]` (legacy-режим).
     */
    public readonly resolvedColumns: Signal<ReadonlyArray<IRtTable.ColumnSettingItem>> = computed(
        (): ReadonlyArray<IRtTable.ColumnSettingItem> => resolveColumns(this.columnsConfig(), this.#columnSettings())
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

    /** `true` когда таблица настраиваемая: есть и `[columnsConfig]`, и `[tableId]`. */
    public readonly canConfigure: Signal<boolean> = computed((): boolean => this.columnsConfig().length > 0 && this.tableId() !== null);

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

        this.#registerSettings();

        // Загрузка сохранённых настроек колонок. Запись может отсутствовать —
        // IndexedDB отдаёт в этом случае undefined, применять нечего.
        const persistedTableId: string | null = this.#persistableTableId();
        if (persistedTableId !== null) {
            this.#settings
                .load(persistedTableId)
                .pipe(takeUntilDestroyed(this.#destroyRef))
                .subscribe((settings: IRtTable.ColumnSettings | undefined): void => {
                    if (settings !== undefined) {
                        this.applyColumnSettings(settings);
                    }
                });
        }
    }

    public override ngOnDestroy(): void {
        if (this.actionsColumnDef !== undefined) {
            this.removeColumnDef(this.actionsColumnDef);
        }
        const tableId: string | null = this.tableId();
        if (tableId !== null) {
            this.#registry.unregister(tableId);
        }
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

    public applyColumnSettings(settings: IRtTable.ColumnSettings): void {
        this.#columnSettings.set(withoutLockedHidden(this.columnsConfig(), settings));
    }

    /**
     * Объявляет таблицу реестру: её колонки, умолчания и приём применения настроек. Реестр —
     * мост к панели настроек, которую потребитель открывает переходом по адресу.
     */
    #registerSettings(): void {
        const tableId: string | null = this.tableId();
        if (tableId === null || !this.canConfigure()) {
            return;
        }
        const registration: IRtTableSettingsRegistration = {
            columns: this.resolvedColumns,
            defaults: this.#defaultColumns,
            apply: (settings: IRtTable.ColumnSettings): void => {
                this.applyColumnSettings(settings);
                this.#persistSettings(settings);
            },
        };
        this.#registry.register(tableId, registration);
    }

    /** Сохраняет настройки колонок у настраиваемой таблицы; у прочих сохранять нечего. */
    #persistSettings(settings: IRtTable.ColumnSettings): void {
        const tableId: string | null = this.#persistableTableId();
        if (tableId !== null) {
            this.#settings.save(tableId, settings);
        }
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

    /**
     * Проверка наличия данных в `dataSource`. CdkTable принимает array | Observable | DataSource —
     * нас интересуют только массивы (client-side filter pattern). Для остальных типов
     * (Observable / DataSource) консервативно возвращаем `true` — не показываем skeleton/empty
     * там где не можем точно определить.
     */
    #hasData(): boolean {
        this.#dataSourceVersion();

        const ds: unknown = this.dataSource;
        if (Array.isArray(ds)) {
            return ds.length > 0;
        }
        return true;
    }
}
