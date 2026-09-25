import { NgTemplateOutlet } from '@angular/common';
import {
    AfterViewChecked,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    ElementRef,
    forwardRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    signal,
    Signal,
    TemplateRef,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
import { EFilterOperatorType, ISortModel, TNullable, transformArrayInput } from '@rt-tools/utils';

import { IRtKitConfig } from '../../config/rt-kit-config.model';
import { rtKitDefault } from '../../config/rt-kit-config.providers';
import { rtKitLabel } from '../../i18n';
import { IRtInput } from '../input/rt-input.model';
import { RtCheckboxComponent } from '../checkbox/rt-checkbox.component';
import { RtMenuComponent } from '../menu/rt-menu.component';
import { RtRadioButtonComponent } from '../radio-button/rt-radio-button.component';
import { RtDataTableCellComponent } from './cell/rt-data-table-cell.component';
import { RtDataTableFilterCellComponent } from './filter-cell/rt-data-table-filter-cell.component';
import { RtDataTableHeaderCellComponent } from './header-cell/rt-data-table-header-cell.component';
import {
    IRtDataTableRowContext,
    RtDataTableAdditionalRowActionsDirective,
    RtDataTableCustomCellsDirective,
    RtDataTableRowActionsDirective,
} from './rt-data-table-cells.directive';
import { RtDataTableConfigService } from './rt-data-table-config.service';
import { RtDataTableIconDirective } from './rt-data-table-icon.directive';
import { RT_DATA_TABLE_ROW_HOST, RtDataTableRowClickDirective } from './rt-data-table-row-click.directive';
import { ERtDataTableColumnType, IRtDataTable, RT_PRESET_MATERIAL_CLASS, TRtDataTableFilters } from './rt-data-table.model';

const BEM_BLOCK: string = 'rt-data-table';

/**
 * Таблица записей первого кита во втором — без Material.
 *
 * Колонки берутся у службы настроек, строки приходят входом. Таблица рисует шапку, строку
 * отбора, готовые или пользовательские ячейки, колонку выбора флажком либо радиокнопкой и полосу
 * действий в конце строки. Своего отбора и своего порядка она не ведёт: обо всём просит
 * приложение. Отметками строк занимается директива выбора — она ставит их сюда.
 */
@Component({
    selector: 'rt-data-table',
    templateUrl: './rt-data-table.component.html',
    styleUrl: './rt-data-table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // components
        RtCheckboxComponent,
        RtDataTableCellComponent,
        RtDataTableFilterCellComponent,
        RtDataTableHeaderCellComponent,
        RtMenuComponent,
        RtRadioButtonComponent,

        // directives
        BlockDirective,
        ElemDirective,
        FormsModule,
        ModDirective,
        NgTemplateOutlet,
        RtDataTableRowClickDirective,
    ],
    host: { class: BEM_BLOCK, '[class.rt-preset-material]': "look() === 'material'" },
    providers: [{ provide: RT_DATA_TABLE_ROW_HOST, useExisting: forwardRef(() => RtDataTableComponent) }],
})
export class RtDataTableComponent<
    ENTITY_TYPE extends Record<string, unknown>,
    SORT_PROPERTY extends Extract<keyof ENTITY_TYPE, string>,
    KEY extends Extract<keyof ENTITY_TYPE, string>,
> implements AfterViewChecked {
    readonly #configService: RtDataTableConfigService<ENTITY_TYPE> = inject(RtDataTableConfigService);

    /* Вид считается из настроек при объявлении входа: вход в разметке по-прежнему перебивает всё. */
    readonly #look: IRtDataTable.Look = rtKitDefault(
        'dataTable',
        (it: IRtKitConfig.DataTable): IRtDataTable.Look | undefined => it.look,
        'material'
    );

    /** Полоса действий и две ячейки, которым она отдаёт свою ширину, — приём первого кита. */
    protected readonly rowActionsRef: Signal<TNullable<ElementRef<HTMLElement>>> = viewChild<ElementRef<HTMLElement>>('rowActions');
    protected readonly headerSpacerRef: Signal<TNullable<ElementRef<HTMLElement>>> = viewChild<ElementRef<HTMLElement>>('headerSpacer');
    protected readonly rowSpacerRef: Signal<TNullable<ElementRef<HTMLElement>>> = viewChild<ElementRef<HTMLElement>>('rowSpacer');

    protected readonly columnTypes: typeof ERtDataTableColumnType = ERtDataTableColumnType;

    /** Классы меню строки: оно открывается поверх страницы и вид семьи получает от неё. */
    protected readonly menuPanelClass: Signal<string[]> = computed(() => (this.look() === 'material' ? [RT_PRESET_MATERIAL_CLASS] : []));

    protected readonly actionsLabel: Signal<string> = rtKitLabel('dataTableActions');
    protected readonly selectRowLabel: Signal<string> = rtKitLabel('dataTableSelectRow');
    protected readonly selectPageLabel: Signal<string> = rtKitLabel('dataTableSelectPage');

    /** Полоса действий рисуется, когда приложение дало меню строки или действия рядом с ним. */
    protected readonly hasRowActions: Signal<boolean> = computed(() => !!this.rowActionsTpl() || !!this.additionalRowActionsTpl());

    protected readonly visibleColumns: Signal<Array<IRtDataTable.Column<ENTITY_TYPE>>> = computed(() =>
        this.columns().filter((column: IRtDataTable.Column<ENTITY_TYPE>) => !column.hidden)
    );

    /** Колонки — из службы настроек: их порядок и видимость помнит она. */
    /** Вид полей отбора: `outline` — рамка со всех сторон, `fill` — залитое поле с чертой снизу. */
    /**
     * Вид семьи. Материальный набор стоит на самом узле, а не на странице: семья выглядит как первый
     * кит, где бы её ни поставили, и соседи на странице своего вида не теряют.
     */
    public readonly look: InputSignal<IRtDataTable.Look> = input<IRtDataTable.Look>(this.#look);

    public readonly filterAppearance: InputSignal<IRtInput.Appearance> = input<IRtInput.Appearance>('outline');

    public readonly columns: Signal<Array<IRtDataTable.Column<ENTITY_TYPE>>> = computed(() => this.#configService.tableConfig().columns);

    public readonly isTableRowsClickable: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });

    /** Свойство, которым записи отличаются друг от друга. */
    public readonly keyExp: InputSignal<NonNullable<KEY>> = input('id' as NonNullable<KEY>);

    public readonly entities: InputSignalWithTransform<ENTITY_TYPE[], ENTITY_TYPE[] | null | undefined> = input.required<
        ENTITY_TYPE[],
        ENTITY_TYPE[] | null | undefined
    >({ transform: transformArrayInput });

    public readonly currentSortModel: InputSignal<TNullable<ISortModel<SORT_PROPERTY>>> =
        input.required<TNullable<ISortModel<SORT_PROPERTY>>>();

    /**
     * Условия отбора. Их ключ — имя свойства колонки, а не ключ записи: отбирают по колонке, и
     * ключ записи здесь оказался бы уже нужного — строка отбора зовёт ячейку именем колонки.
     */
    public readonly filterModel: InputSignalWithTransform<TRtDataTableFilters<ENTITY_TYPE>, TNullable<TRtDataTableFilters<ENTITY_TYPE>>> =
        input<TRtDataTableFilters<ENTITY_TYPE>, TNullable<TRtDataTableFilters<ENTITY_TYPE>>>([], { transform: transformArrayInput });

    public readonly isFiltersShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });

    public readonly rowClick: OutputEmitterRef<{ row: ENTITY_TYPE; event: MouseEvent }> = output<{ row: ENTITY_TYPE; event: MouseEvent }>();
    public readonly rowDoubleClick: OutputEmitterRef<ENTITY_TYPE> = output<ENTITY_TYPE>();
    public readonly sortChange: OutputEmitterRef<ISortModel<SORT_PROPERTY>> = output<ISortModel<SORT_PROPERTY>>();
    public readonly filterChange: OutputEmitterRef<TRtDataTableFilters<ENTITY_TYPE>> = output<TRtDataTableFilters<ENTITY_TYPE>>();

    public readonly customCellsTpl: Signal<TNullable<RtDataTableCustomCellsDirective<ENTITY_TYPE>>> =
        contentChild(RtDataTableCustomCellsDirective);

    public readonly rowActionsTpl: Signal<TNullable<TemplateRef<IRtDataTableRowContext<ENTITY_TYPE>>>> = contentChild(
        RtDataTableRowActionsDirective,
        { read: TemplateRef }
    );

    public readonly additionalRowActionsTpl: Signal<TNullable<TemplateRef<IRtDataTableRowContext<ENTITY_TYPE>>>> = contentChild(
        RtDataTableAdditionalRowActionsDirective,
        { read: TemplateRef }
    );

    /** Шаблон значка приложения: его получают и шапка, и готовая ячейка. */
    public readonly iconTpl: Signal<TNullable<RtDataTableIconDirective<ENTITY_TYPE>>> = contentChild(RtDataTableIconDirective);

    /** Ключи отмеченных записей; их ставит директива выбора. */
    public readonly selectedEntitiesIds: WritableSignal<ENTITY_TYPE[KEY][]> = signal([]);
    public readonly isPageEntitiesSelected: WritableSignal<boolean> = signal(false);
    public readonly isPageEntitiesIndeterminate: WritableSignal<boolean> = signal(false);
    public readonly isMultiSelect: WritableSignal<boolean> = signal(true);
    public readonly isSelectorsColumnShown: WritableSignal<boolean> = signal(false);
    public readonly isSelectorsColumnDisabled: WritableSignal<boolean> = signal(false);

    /** Строка с открытым меню; у первого кита она подсвечена, пока меню открыто. */
    public readonly activeRowIndex: WritableSignal<TNullable<number>> = signal(null);

    /** Отметить запись; метод ставит директива выбора, без неё колонки выбора нет вовсе. */
    public onToggleEntity: (entity: ENTITY_TYPE, checked: boolean) => void = (): void => undefined;

    /** Отметить все строки показанной страницы; метод ставит директива выбора. */
    public onTogglePageEntities: (checked: boolean) => void = (): void => undefined;

    public ngAfterViewChecked(): void {
        this.#syncSpacerWidth();
    }

    /**
     * Имя колонки приходит строкой, а наружу уходит ключом домена: приведение сверяется с тем же
     * набором колонок, который рисует таблица. Несовпавшее не отдаётся вовсе — приём первого кита.
     */
    public onSortChange(sortModel: ISortModel<string>): void {
        const names: string[] = this.columns().map((column: IRtDataTable.Column<ENTITY_TYPE>) => String(column.propName));

        if (names.includes(sortModel.propertyName)) {
            this.sortChange.emit({ ...sortModel, propertyName: sortModel.propertyName as SORT_PROPERTY });
        }
    }

    public onFilterChange(filterModel: TRtDataTableFilters<ENTITY_TYPE>): void {
        this.filterChange.emit(filterModel);
    }

    public onRowClick(row: ENTITY_TYPE, event: MouseEvent): void {
        this.rowClick.emit({ row, event });
    }

    public onRowDoubleClick(row: ENTITY_TYPE): void {
        this.rowDoubleClick.emit(row);
    }

    protected onMenuOpenedChange(index: number, opened: boolean): void {
        this.activeRowIndex.set(opened ? index : null);
    }

    protected defaultOperator(column: IRtDataTable.Column<ENTITY_TYPE>): IRtDataTable.Column<ENTITY_TYPE>['defaultFilterOperator'] {
        return column.defaultFilterOperator ?? EFilterOperatorType.EQUALS;
    }

    /**
     * Полоса действий висит над концом строки, и место под неё держат две пустые ячейки — в
     * шапке и в строке. Ширину им таблица ставит по ширине самой полосы, как первый кит.
     */
    #syncSpacerWidth(): void {
        const strip: TNullable<HTMLElement> = this.rowActionsRef()?.nativeElement;

        if (!strip) {
            return;
        }

        const width: string = `${strip.offsetWidth}px`;

        [this.headerSpacerRef()?.nativeElement, this.rowSpacerRef()?.nativeElement].forEach((spacer: TNullable<HTMLElement>) => {
            if (spacer && spacer.style.width !== width) {
                spacer.style.width = width;
            }
        });
    }
}
