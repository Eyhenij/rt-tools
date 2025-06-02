import { NgTemplateOutlet } from '@angular/common';
import {
    AfterViewChecked,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    Directive,
    ElementRef,
    forwardRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    TemplateRef,
    viewChild,
    WritableSignal,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatRadioButton } from '@angular/material/radio';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { Nullable, RtIconOutlinedDirective, transformArrayInput } from '../../../../util';
import {
    FILTER_OPERATOR_TYPE_ENUM,
    FilterModel,
    IRtuiTable,
    ITable,
    RTUI_TABLE_COMPONENT_TOKEN,
    SortModel,
    TABLE_COLUMN_TYPES_ENUM,
} from '../../util';
import { RtTableConfigService } from '../../util/table-config.service';
import { TableBaseCellComponent } from '../table-base-cell/table-base-cell.component';
import { RtuiTableHeaderCellComponent } from '../table-header-cell/table-header-cell.component';
import { RtuiTableHeaderFilterCellComponent } from '../table-header-filter-cell/table-header-filter-cell.component';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { BooleanInput } from '@angular/cdk/coercion';
import { RtuiTableRowClickDirective } from '../../directives';

/** Directive for custom table cells */
@Directive({
    selector: '[rtuiCustomTableCellsDirective]',
})
export class RtuiCustomTableCellsDirective<ENTITY_TYPE> {
    public cellsTemplates: InputSignal<{
        [K in keyof ENTITY_TYPE]: TemplateRef<{ $implicit: ENTITY_TYPE }>;
    }> = input.required({
        alias: 'rtuiCustomTableCellsDirective',
    });

    public getTemplateByPropName(propName: keyof ENTITY_TYPE): TemplateRef<{ $implicit: ENTITY_TYPE }> {
        return this.cellsTemplates()[propName];
    }
}

/** Directive for row actions located inside a row menu button */
@Directive({
    selector: '[rtuiTabletRowActionsDirective]',
})
export class RtuiTableRowActionsDirective {}

/** Directive for row actions located outside a row menu button */
@Directive({
    selector: '[rtuiTableAdditionalRowActionsDirective]',
})
export class RtuiTableAdditionalRowActionsDirective {}

@Component({
    selector: 'rtui-table',
    templateUrl: './rtui-table.component.html',
    styleUrls: ['./rtui-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: RTUI_TABLE_COMPONENT_TOKEN,
            useExisting: forwardRef(() => RtuiTableComponent),
        },
    ],
    imports: [
        NgTemplateOutlet,

        // material
        MatIconButton,
        MatMenuTrigger,
        MatIcon,
        MatMenu,
        MatCheckbox,
        MatRadioButton,

        // directives
        BlockDirective,
        ElemDirective,
        RtIconOutlinedDirective,
        RtuiTableRowClickDirective,

        // components
        RtuiTableHeaderCellComponent,
        TableBaseCellComponent,
        RtuiTableHeaderFilterCellComponent,
    ],
})
export class RtuiTableComponent<
        ENTITY_TYPE extends Record<string, unknown>,
        SORT_PROPERTY extends Extract<keyof ENTITY_TYPE, string>,
        KEY extends Extract<keyof ENTITY_TYPE, string>,
    >
    implements IRtuiTable<ENTITY_TYPE, SORT_PROPERTY, KEY>, AfterViewChecked
{
    protected readonly rowActions: Signal<Nullable<ElementRef<HTMLElement>>> = viewChild<ElementRef<HTMLElement>>('rowActions');
    protected readonly rowActionsHeaderPaddingHelper: Signal<Nullable<ElementRef<HTMLElement>>> =
        viewChild<ElementRef<HTMLElement>>('rowActionsHeaderPaddingHelper');
    protected readonly rowActionsPaddingHelper: Signal<Nullable<ElementRef<HTMLElement>>> =
        viewChild<ElementRef<HTMLElement>>('rowActionsRowPaddingHelper');

    readonly #tableConfigService: RtTableConfigService<ENTITY_TYPE> = inject(RtTableConfigService);

    protected readonly columnTypes: typeof TABLE_COLUMN_TYPES_ENUM = TABLE_COLUMN_TYPES_ENUM;
    protected readonly filterOperators: typeof FILTER_OPERATOR_TYPE_ENUM = FILTER_OPERATOR_TYPE_ENUM;

    /** Indicates is mobile view */
    public isMobile: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Indicates are table rows clickable */
    public isTableRowsClickable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Key of ENTITY_TYPE for compare entities */
    public keyExp: InputSignal<NonNullable<KEY>> = input('id' as NonNullable<KEY>);

    /** List of entities */
    public entities: InputSignalWithTransform<ENTITY_TYPE[], ENTITY_TYPE[]> = input.required<ENTITY_TYPE[], ENTITY_TYPE[]>({
        transform: (value: ENTITY_TYPE[]) => transformArrayInput(value),
    });
    /** Current page model from store */
    public currentSortModel: InputSignal<Nullable<SortModel<SORT_PROPERTY>>> = input.required();
    /** Current elements appearance */
    public appearance: InputSignal<MatFormFieldAppearance> = input.required({
        transform: (value: MatFormFieldAppearance) => (value === 'fill' ? 'fill' : 'outline'),
    });
    /** Filter inputs appearance */
    public filterAppearance: InputSignal<MatFormFieldAppearance> = input<MatFormFieldAppearance>('outline');
    /** Current filter model from store */
    public filterModel: InputSignalWithTransform<FilterModel<KEY>[], FilterModel<KEY>[]> = input<FilterModel<KEY>[], FilterModel<KEY>[]>(
        [],
        {
            transform: (value: FilterModel<KEY>[]) => transformArrayInput(value),
        }
    );
    /** Indicates is filters shown */
    public isFiltersShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Row click output action */
    public readonly rowClick: OutputEmitterRef<NonNullable<{ row: ENTITY_TYPE; event: MouseEvent }>> =
        output<NonNullable<{ row: ENTITY_TYPE; event: MouseEvent }>>();
    /** Row doubleClick output action */
    public readonly rowDoubleClick: OutputEmitterRef<NonNullable<ENTITY_TYPE>> = output<NonNullable<ENTITY_TYPE>>();
    /** Sort change output action */
    public readonly sortChange: OutputEmitterRef<SortModel<SORT_PROPERTY>> = output<SortModel<SORT_PROPERTY>>();
    /** Filter change output action */
    public readonly filterChange: OutputEmitterRef<FilterModel<KEY>[]> = output<FilterModel<KEY>[]>();

    /** Columns config for table */
    public columns: Signal<Array<ITable.Column<ENTITY_TYPE>>> = computed(() => {
        return this.#tableConfigService.tableConfig().columns;
    });

    /** Custom cells template */
    public readonly customCellsTpl: Signal<Nullable<RtuiCustomTableCellsDirective<ENTITY_TYPE>>> =
        contentChild(RtuiCustomTableCellsDirective);
    /** Row actions template */
    public readonly rowActionsTpl: Signal<
        Nullable<
            TemplateRef<{
                $implicit: ENTITY_TYPE;
            }>
        >
    > = contentChild(RtuiTableRowActionsDirective, {
        read: TemplateRef,
    });
    /** Additional row actions template */
    public readonly additionalRowActionsTpl: Signal<Nullable<TemplateRef<RtuiTableAdditionalRowActionsDirective>>> = contentChild(
        RtuiTableAdditionalRowActionsDirective,
        {
            read: TemplateRef,
        }
    );

    /** Fields specified by the directive */
    /** List of selected entities ids */
    public readonly selectedEntitiesIds: WritableSignal<ENTITY_TYPE[KEY][]> = signal([]);
    /** Indicates are all page entities selected */
    public readonly isPageEntitiesSelected: WritableSignal<boolean> = signal(false);
    /** Indicates are some page entities selected */
    public readonly isPageEntitiesIndeterminate: WritableSignal<boolean> = signal(false);
    /** Indicates is multiselect mod enabled */
    public readonly isMultiSelect: WritableSignal<boolean> = signal(true);
    /** Indicates is selectors column shown */
    public readonly isSelectorsColumnShown: WritableSignal<boolean> = signal(false);
    /** Indicates is selectors column disabled */
    public readonly isSelectorsColumnDisabled: WritableSignal<boolean> = signal(false);
    /** Current row index */
    public readonly activeRowIndex: WritableSignal<Nullable<number>> = signal(null);

    public ngAfterViewChecked(): void {
        this.#setPaddingHelperWidth();
    }

    /** Sort change output action */
    public onSortChange(sortModel: SortModel<string>): void {
        // TODO: add type guard
        this.sortChange.emit(sortModel as SortModel<SORT_PROPERTY>);
    }

    /** Filter change output action */
    public onFilterChange(filterModel: FilterModel<KEY>[]): void {
        this.filterChange.emit(filterModel);
    }

    /** Open row actions menu */
    public onMenuOpen(index: number): void {
        this.activeRowIndex.set(index);
    }

    /** Close the row actions menu */
    public onMenuClose(): void {
        this.activeRowIndex.set(null);
    }

    /** Row click output actions */
    public onRowClick(row: NonNullable<ENTITY_TYPE>, event: MouseEvent): void {
        this.rowClick.emit({ row, event });
    }

    /** Row doubleClick output action */
    public onRowDoubleClick(row: NonNullable<ENTITY_TYPE>): void {
        this.rowDoubleClick.emit(row);
    }

    /** Empty methods set in selectors directive */
    public onToggleEntity: (entity: ENTITY_TYPE, checked: boolean) => void = (): void => {
        return;
    };
    public onTogglePageEntities: (checked: boolean) => void = (): void => {
        return;
    };

    /**
     * Updates the width of padding helpers dynamically to match the width of `rowActions`.
     * Ensures that the width of `rowActionsHeaderPaddingHelper` and `rowActionsPaddingHelper`
     * is consistent with the current `rowActions` width.
     */
    #setPaddingHelperWidth(): void {
        if (this.rowActions()) {
            const rowActionsWidth: number = this.rowActions()?.nativeElement.offsetWidth || 0;

            const headerWidth: number = parseInt(this.rowActionsHeaderPaddingHelper()?.nativeElement?.style.width || '0', 10);
            const paddingWidth: number = parseInt(this.rowActionsPaddingHelper()?.nativeElement?.style.width || '0', 10);

            if (rowActionsWidth !== headerWidth || rowActionsWidth !== paddingWidth) {
                const headerEl: Nullable<HTMLElement> = this.rowActionsHeaderPaddingHelper()?.nativeElement;
                const paddingEl: Nullable<HTMLElement> = this.rowActionsPaddingHelper()?.nativeElement;

                if (headerEl) {
                    headerEl.style.width = `${rowActionsWidth}px`;
                }

                if (paddingEl) {
                    paddingEl.style.width = `${rowActionsWidth}px`;
                }
            }
        }
    }
}
