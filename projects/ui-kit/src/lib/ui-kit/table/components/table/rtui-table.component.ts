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

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
import { INullable } from '@rt-tools/utils';
import { FILTER_OPERATOR_TYPE_ENUM, IFilterModel, ISortModel, transformArrayInput } from '@rt-tools/utils';
import { RtIconOutlinedDirective } from '@rt-tools/core';
import { IRtuiTable, ITable, RTUI_TABLE_COMPONENT_TOKEN, RtTableConfigService, TABLE_COLUMN_TYPES_ENUM } from '../../util';
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
        ModDirective,
        RtIconOutlinedDirective,
        RtuiTableRowClickDirective,

        // components
        RtuiTableHeaderCellComponent,
        TableBaseCellComponent,
        RtuiTableHeaderFilterCellComponent,
    ],
    providers: [
        {
            provide: RTUI_TABLE_COMPONENT_TOKEN,
            useExisting: forwardRef(() => RtuiTableComponent),
        },
    ],
})
export class RtuiTableComponent<
    ENTITY_TYPE extends Record<string, unknown>,
    SORT_PROPERTY extends Extract<keyof ENTITY_TYPE, string>,
    KEY extends Extract<keyof ENTITY_TYPE, string>,
>
    implements IRtuiTable<ENTITY_TYPE, SORT_PROPERTY, KEY>, AfterViewChecked
{
    protected readonly rowActions: Signal<INullable<ElementRef<HTMLElement>>> = viewChild<ElementRef<HTMLElement>>('rowActions');
    protected readonly rowActionsHeaderPaddingHelper: Signal<INullable<ElementRef<HTMLElement>>> =
        viewChild<ElementRef<HTMLElement>>('rowActionsHeaderPaddingHelper');
    protected readonly rowActionsPaddingHelper: Signal<INullable<ElementRef<HTMLElement>>> =
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
    public currentSortModel: InputSignal<INullable<ISortModel<SORT_PROPERTY>>> = input.required();
    /** Current elements appearance */
    public appearance: InputSignal<MatFormFieldAppearance> = input.required({
        transform: (value: MatFormFieldAppearance) => (value === 'fill' ? 'fill' : 'outline'),
    });
    /** Filter inputs appearance */
    public filterAppearance: InputSignal<MatFormFieldAppearance> = input<MatFormFieldAppearance>('outline');
    /** Current filter model from store */
    public filterModel: InputSignalWithTransform<IFilterModel<KEY>[], IFilterModel<KEY>[]> = input<
        IFilterModel<KEY>[],
        IFilterModel<KEY>[]
    >([], {
        transform: (value: IFilterModel<KEY>[]) => transformArrayInput(value),
    });
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
    public readonly sortChange: OutputEmitterRef<ISortModel<SORT_PROPERTY>> = output<ISortModel<SORT_PROPERTY>>();
    /** Filter change output action */
    public readonly filterChange: OutputEmitterRef<IFilterModel<KEY>[]> = output<IFilterModel<KEY>[]>();

    /** Columns config for table */
    public columns: Signal<Array<ITable.Column<ENTITY_TYPE>>> = computed(() => {
        return this.#tableConfigService.tableConfig().columns;
    });

    /** Custom cells template */
    public readonly customCellsTpl: Signal<INullable<RtuiCustomTableCellsDirective<ENTITY_TYPE>>> =
        contentChild(RtuiCustomTableCellsDirective);
    /** Row actions template */
    public readonly rowActionsTpl: Signal<
        INullable<
            TemplateRef<{
                $implicit: ENTITY_TYPE;
            }>
        >
    > = contentChild(RtuiTableRowActionsDirective, {
        read: TemplateRef,
    });
    /** Additional row actions template */
    public readonly additionalRowActionsTpl: Signal<INullable<TemplateRef<RtuiTableAdditionalRowActionsDirective>>> = contentChild(
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
    public readonly activeRowIndex: WritableSignal<INullable<number>> = signal(null);

    public ngAfterViewChecked(): void {
        this.#setPaddingHelperWidth();
    }

    /** Sort change output action */
    public onSortChange(sortModel: ISortModel<string>): void {
        // TODO: add type guard
        this.sortChange.emit(sortModel as ISortModel<SORT_PROPERTY>);
    }

    /** Filter change output action */
    public onFilterChange(filterModel: IFilterModel<KEY>[]): void {
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
                const headerEl: INullable<HTMLElement> = this.rowActionsHeaderPaddingHelper()?.nativeElement;
                const paddingEl: INullable<HTMLElement> = this.rowActionsPaddingHelper()?.nativeElement;

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
