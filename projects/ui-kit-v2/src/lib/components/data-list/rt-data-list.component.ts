import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    DestroyRef,
    effect,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    viewChild,
    ViewEncapsulation,
} from '@angular/core';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject } from 'rxjs';
import { exhaustMap, filter } from 'rxjs/operators';
import { IRtKitConfig } from '../../config/rt-kit-config.model';
import { rtKitDefault } from '../../config/rt-kit-config.providers';
import { IRtInput } from '../input/rt-input.model';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { IPageModel, ISortModel, TNullable, transformArrayInput } from '@rt-tools/utils';

import { rtKitLabel } from '../../i18n';
import { RtAsideService } from '../aside/rt-aside.service';
import { RtDataTableComponent } from '../data-table/rt-data-table.component';
import { RtDataTableConfigService } from '../data-table/rt-data-table-config.service';
import { RtDataTableIconDirective } from '../data-table/rt-data-table-icon.directive';
import {
    RtDataTableAdditionalRowActionsDirective,
    RtDataTableCustomCellsDirective,
    RtDataTableRowActionsDirective,
} from '../data-table/rt-data-table-cells.directive';
import { IRtDataTable, RT_PRESET_MATERIAL_CLASS, TRtDataTableFilters } from '../data-table/rt-data-table.model';
import { RtEmptyStateComponent } from '../empty-state/rt-empty-state.component';
import { RtSpinnerComponent } from '../spinner/rt-spinner.component';
import { RtPaginationComponent } from '../pagination/rt-pagination.component';
import { dataListPageAfterSizeChange, dataListPageSizes } from './rt-data-list-pagination.logic';
import { RtDataListSettingsAsideComponent } from './settings/rt-data-list-settings-aside.component';
import { RtDataListToolbarComponent } from './toolbar/rt-data-list-toolbar.component';
import {
    RtDataListAdditionalRowActionsDirective,
    RtDataListCustomCellsDirective,
    RtDataListRowActionsDirective,
} from './rt-data-list.directive';
import { RtDataListToolbarActionsDirective, RtDataListToolbarSelectorsDirective } from './rt-data-list-toolbar.directive';

const BEM_BLOCK: string = 'rt-data-list';

/** Показанная полоса прокрутки — ступень размеров кита, та же, что в основе его полос. */
const SCROLLBAR_SIZE: string = 'var(--rt-size-3)';

/** Скрытая полоса — нулевой размер: прокрутка остаётся, видно её не будет. */
const SCROLLBAR_HIDDEN: string = '0';

/**
 * Список записей первого кита во втором: панель действий, таблица, полоса страниц, заглушка
 * пустого списка и вид загрузки.
 *
 * Своего состояния список не ведёт вовсе: страницу, порядок, условия отбора и поиск он просит у
 * приложения. Службу настроек колонок объявляет и наполняет само приложение — список её только
 * читает и пишет в неё сохранённое панелью, которую поднимает службой боковых панелей кита.
 */
@Component({
    selector: 'rt-data-list',
    templateUrl: './rt-data-list.component.html',
    styleUrl: './rt-data-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // components
        RtPaginationComponent,
        RtDataListToolbarComponent,
        RtDataTableComponent,
        RtEmptyStateComponent,
        RtSpinnerComponent,

        // directives
        BlockDirective,
        ElemDirective,
        NgTemplateOutlet,
        RtDataListToolbarActionsDirective,
        RtDataListToolbarSelectorsDirective,
        RtDataTableAdditionalRowActionsDirective,
        RtDataTableCustomCellsDirective,
        RtDataTableIconDirective,
        RtDataTableRowActionsDirective,
    ],
    host: { class: BEM_BLOCK, '[class.rt-preset-material]': "look() === 'material'" },
})
export class RtDataListComponent<
    ENTITY_TYPE extends Record<string, unknown>,
    SORT_PROPERTY extends Extract<keyof ENTITY_TYPE, string>,
    KEY extends Extract<keyof ENTITY_TYPE, string>,
> {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #asideService: RtAsideService = inject(RtAsideService);

    /* Вид считается из настроек при объявлении входа: вход в разметке по-прежнему перебивает всё. */
    readonly #look: IRtDataTable.Look = rtKitDefault(
        'dataTable',
        (it: IRtKitConfig.DataTable): IRtDataTable.Look | undefined => it.look,
        'material'
    );
    readonly #appearance: IRtInput.Appearance = rtKitDefault(
        'dataList',
        (it: IRtKitConfig.DataList): IRtInput.Appearance | undefined => it.appearance,
        'fill'
    );
    readonly #filterAppearance: IRtInput.Appearance | undefined = rtKitDefault<'dataList', IRtInput.Appearance | undefined>(
        'dataList',
        (it: IRtKitConfig.DataList): IRtInput.Appearance | undefined => it.filterAppearance,
        undefined
    );
    readonly #configService: RtDataTableConfigService<ENTITY_TYPE> = inject(RtDataTableConfigService);
    readonly #pageRoot: HTMLElement = inject(DOCUMENT).documentElement;

    /**
     * Нажатия на «настроить колонки». Панель открывается объявленным потоком, а `exhaustMap`
     * держит одну открытую: второе нажатие при открытой панели открывать нечего — приём первого
     * кита, там иначе настройку сохраняла та панель, что закрылась последней.
     */
    readonly #openSettingsSource: Subject<void> = new Subject<void>();

    protected readonly placeholderLabel: Signal<string> = rtKitLabel('dataListPlaceholder');

    /** Заглушку показывают, когда нет ни строк, ни условий отбора. */
    protected readonly isPlaceholderShown: Signal<boolean> = computed(() => !this.entities().length && !this.filterModel().length);

    /** Вид полей отбора, который получает таблица: свой, а без него — вид поиска. */
    protected readonly filterFieldAppearance: Signal<IRtInput.Appearance> = computed(
        (): IRtInput.Appearance => this.filterAppearance() ?? this.appearance()
    );

    protected readonly isFiltersEmpty: Signal<boolean> = computed(() => !this.filterModel().length);

    /** Размеры страницы, которые предлагает полоса: те же, что у первого кита. */
    protected readonly pageSizes: Signal<number[]> = computed(() => dataListPageSizes(this.pageModel()));

    /**
     * Вид семьи. Материальный набор стоит на самом узле, а не на странице: семья выглядит как первый
     * кит, где бы её ни поставили, и соседи на странице своего вида не теряют.
     */
    public readonly look: InputSignal<IRtDataTable.Look> = input<IRtDataTable.Look>(this.#look);

    /** Вид поля поиска, как `appearance` списка первого кита; умолчание берётся из настроек кита. */
    public readonly appearance: InputSignal<IRtInput.Appearance> = input<IRtInput.Appearance>(this.#appearance);

    /**
     * Вид полей отбора: `outline` — рамка со всех сторон, `fill` — залитое поле с чертой снизу. Не
     * заданный ни входом, ни настройками кита, он берётся из `appearance`: поля отбора выглядят
     * как поле поиска того же списка.
     */
    public readonly filterAppearance: InputSignal<IRtInput.Appearance | undefined> = input<IRtInput.Appearance | undefined>(
        this.#filterAppearance
    );

    /** Контурные значки кнопок полосы: очистки отбора, обновления и настройки колонок, как у первого кита. */
    public readonly isToolbarActionsIconsOutlined: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });

    public readonly tableConfigStorageKey: InputSignal<string> = input.required<string>();

    public readonly entities: InputSignalWithTransform<ENTITY_TYPE[], ENTITY_TYPE[] | null | undefined> = input.required<
        ENTITY_TYPE[],
        ENTITY_TYPE[] | null | undefined
    >({ transform: transformArrayInput });

    public readonly pageModel: InputSignal<IPageModel> = input.required<IPageModel>();
    public readonly currentSortModel: InputSignal<TNullable<ISortModel<SORT_PROPERTY>>> =
        input.required<TNullable<ISortModel<SORT_PROPERTY>>>();

    public readonly searchTerm: InputSignal<TNullable<string>> = input<TNullable<string>>('');

    /** Условия отбора: их ключ — имя свойства колонки, а не ключ записи, как и у таблицы. */
    public readonly filterModel: InputSignalWithTransform<TRtDataTableFilters<ENTITY_TYPE>, TNullable<TRtDataTableFilters<ENTITY_TYPE>>> =
        input<TRtDataTableFilters<ENTITY_TYPE>, TNullable<TRtDataTableFilters<ENTITY_TYPE>>>([], { transform: transformArrayInput });

    public readonly keyExp: InputSignal<NonNullable<KEY>> = input('id' as NonNullable<KEY>);

    /** Первая загрузка: вместо списка крутилка. */
    public readonly loading: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });

    /** Дозагрузка: строки остаются, а поверх них крутилка с подложкой. */
    public readonly fetching: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });

    public readonly isTableRowsClickable: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });

    public readonly isFiltersShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });

    public readonly isRefreshButtonShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });

    public readonly isTableConfigButtonShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });

    /**
     * Признак полосы страниц первый кит принимал и никуда не передавал: полоса рисуется по своим
     * правилам. Принят здесь ради переезда без правок и так же ничего не меняет.
     */
    public readonly isPaginationShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });

    public readonly sortChange: OutputEmitterRef<ISortModel<SORT_PROPERTY>> = output<ISortModel<SORT_PROPERTY>>();
    public readonly filterChange: OutputEmitterRef<TRtDataTableFilters<ENTITY_TYPE>> = output<TRtDataTableFilters<ENTITY_TYPE>>();
    public readonly pageModelChange: OutputEmitterRef<Partial<IPageModel>> = output<Partial<IPageModel>>();
    public readonly searchChange: OutputEmitterRef<string> = output<string>();
    public readonly refresh: OutputEmitterRef<void> = output<void>();
    public readonly clearFiltersAction: OutputEmitterRef<void> = output<void>();
    public readonly rowClick: OutputEmitterRef<{ row: ENTITY_TYPE; event: MouseEvent }> = output<{ row: ENTITY_TYPE; event: MouseEvent }>();
    public readonly rowDoubleClick: OutputEmitterRef<ENTITY_TYPE> = output<ENTITY_TYPE>();

    public readonly toolbarSelectorsTpl: Signal<TNullable<TemplateRef<unknown>>> = contentChild(RtDataListToolbarSelectorsDirective, {
        read: TemplateRef,
    });

    public readonly toolbarActionsTpl: Signal<TNullable<TemplateRef<unknown>>> = contentChild(RtDataListToolbarActionsDirective, {
        read: TemplateRef,
    });

    public readonly customCellsTpl: Signal<TNullable<RtDataListCustomCellsDirective<ENTITY_TYPE>>> =
        contentChild(RtDataListCustomCellsDirective);

    public readonly rowActionsTpl: Signal<TNullable<TemplateRef<{ $implicit: ENTITY_TYPE }>>> = contentChild(
        RtDataListRowActionsDirective,
        { read: TemplateRef }
    );

    public readonly additionalRowActionsTpl: Signal<TNullable<TemplateRef<{ $implicit: ENTITY_TYPE }>>> = contentChild(
        RtDataListAdditionalRowActionsDirective,
        { read: TemplateRef }
    );

    /**
     * Шаблон значка приложения — он уезжает в таблицу списка.
     *
     * Родовой тип здесь по умолчанию, а не тип записи списка, и это не упрощение: шаблон-посредник
     * внутри разметки объявлен той же директивой, а родового довода разметка ей не даёт — она
     * ставит его по умолчанию. Объявленное здесь по типу записи расходится с ним, и сборка
     * библиотеки отказывает на выводе шаблона. Приложение своего значка не теряет: его собственный
     * шаблон объявлен той же директивой и тем же умолчанием.
     */
    public readonly iconTpl: Signal<TNullable<RtDataTableIconDirective>> = contentChild(RtDataTableIconDirective);

    /** Панель действий и таблица: их состояние ставит директива выбора списка. */
    public readonly toolbarRef: Signal<TNullable<RtDataListToolbarComponent>> = viewChild(RtDataListToolbarComponent);

    public readonly tableRef: Signal<TNullable<RtDataTableComponent<ENTITY_TYPE, SORT_PROPERTY, KEY>>> =
        viewChild<RtDataTableComponent<ENTITY_TYPE, SORT_PROPERTY, KEY>>(RtDataTableComponent);

    constructor() {
        /* Размер полос прокрутки ставится на корень страницы, а не на список: приём первого
           кита — выбор, сохранённый одним списком, достаётся каждому списку страницы. Скрытая
           полоса — это нулевой размер, а не запрет прокрутки: содержимое по-прежнему ездит. */
        effect(() => {
            const config: IRtDataTable.Config.Data<ENTITY_TYPE> = this.#configService.tableConfig();

            this.#pageRoot.style.setProperty(
                '--rt-data-table-scrollbar-vertical-width',
                config.isVerticalScrollbarShown ? SCROLLBAR_SIZE : SCROLLBAR_HIDDEN
            );
            this.#pageRoot.style.setProperty(
                '--rt-data-table-scrollbar-horizontal-height',
                config.isHorizontalScrollbarShown ? SCROLLBAR_SIZE : SCROLLBAR_HIDDEN
            );
        });

        this.#openSettingsSource
            .pipe(
                exhaustMap((): Observable<IRtDataTable.Config.Data<ENTITY_TYPE> | undefined> =>
                    this.#asideService
                        .open<
                            RtDataListSettingsAsideComponent<ENTITY_TYPE>,
                            IRtDataTable.Config.Data<ENTITY_TYPE>,
                            IRtDataTable.Config.Data<ENTITY_TYPE> | undefined
                        >(RtDataListSettingsAsideComponent, {
                            data: this.#configService.tableConfig(),
                            position: 'right',
                            // Панель и подложка под ней живут поверх страницы, вне списка, и вид списка
                            // до них сам не доходит: класс набора они получают от того, кто их открыл.
                            panelClass: this.look() === 'material' ? RT_PRESET_MATERIAL_CLASS : [],
                            backdropClass:
                                this.look() === 'material' ? ['rt-aside-backdrop', RT_PRESET_MATERIAL_CLASS] : 'rt-aside-backdrop',
                        })
                        .afterClosed()
                ),
                filter(Boolean),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((config: IRtDataTable.Config.Data<ENTITY_TYPE>) => {
                this.#configService.updateConfig(this.tableConfigStorageKey(), config);
            });
    }

    protected onOpenSettings(): void {
        this.#openSettingsSource.next();
    }

    protected onSortChange(sortModel: ISortModel<SORT_PROPERTY>): void {
        this.sortChange.emit(sortModel);
    }

    protected onFilterChange(filterModel: TRtDataTableFilters<ENTITY_TYPE>): void {
        this.filterChange.emit(filterModel);
    }

    protected onPageNumber(pageNumber: number): void {
        this.pageModelChange.emit({ pageNumber });
    }

    /** Новый размер страницы: человек остаётся на том же расстоянии от конца списка, как в первом ките. */
    protected onPageSize(pageSize: number): void {
        this.pageModelChange.emit(dataListPageAfterSizeChange(this.pageModel(), pageSize));
    }

    protected onSearchChange(search: string): void {
        this.searchChange.emit(search);
    }

    protected onRefresh(): void {
        this.refresh.emit();
    }

    protected onClearFilters(): void {
        this.clearFiltersAction.emit();
    }

    protected onRowClick(event: { row: ENTITY_TYPE; event: MouseEvent }): void {
        this.rowClick.emit(event);
    }

    protected onRowDoubleClick(row: ENTITY_TYPE): void {
        this.rowDoubleClick.emit(row);
    }
}
