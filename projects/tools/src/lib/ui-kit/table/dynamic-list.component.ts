import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    Directive,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    Type,
    viewChild,
} from '@angular/core';
import { MatFormFieldAppearance } from '@angular/material/form-field';

import { Nullable, transformArrayInput, transformStringInput } from '../../util';
import {
    RtuiCustomTableCellsDirective,
    RtuiTableAdditionalRowActionsDirective,
    RtuiTableComponent,
    RtuiTableRowActionsDirective,
} from './components';
import {
    RtuiTableContainerComponent,
    RtuiTableToolbarActionsDirective,
    RtuiTableToolbarSelectorsDirective,
} from './components/table-container/table-container.component';
import { PageModel, SortModel, FilterModel } from './util/lists.interface';
import { BooleanInput } from '@angular/cdk/coercion';

/** Directive for selectors of the toolbar located on the left side */
@Directive({
    selector: '[rtuiDynamicListToolbarSelectorsDirective]',
})
export class RtuiDynamicListToolbarSelectorsDirective {}

/** Directive for actions of the toolbar located on the right side */
@Directive({
    selector: '[rtuiDynamicListToolbarActionsDirective]',
})
export class RtuiDynamicListToolbarActionsDirective {}

/** Directive for custom table cells */
@Directive({
    selector: '[rtuiDynamicListCustomTableCellsDirective]',
})
export class RtuiDynamicListCustomTableCellsDirective<ENTITY_TYPE> {
    public cellsTemplates: InputSignal<{ [K in keyof ENTITY_TYPE]: TemplateRef<{ $implicit: ENTITY_TYPE }> }> = input.required({
        alias: 'rtuiDynamicListCustomTableCellsDirective',
    });
}

/** Directive for row actions located inside a row menu button */
@Directive({
    selector: '[rtuiDynamicListRowActionsDirective]',
})
export class RtuiDynamicListRowActionsDirective {}

/** Directive for row actions located outside a row menu button */
@Directive({
    selector: '[rtuiDynamicListRowAdditionalActionsDirective]',
})
export class RtuiDynamicListRowAdditionalActionsDirective {}

@Component({
    selector: 'rtui-dynamic-list',
    templateUrl: './dynamic-list.component.html',
    styleUrls: ['./dynamic-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,

        // Directives
        RtuiTableToolbarActionsDirective,
        RtuiTableRowActionsDirective,
        RtuiTableToolbarSelectorsDirective,
        RtuiTableAdditionalRowActionsDirective,

        // Ui-kit
        RtuiTableContainerComponent,
        RtuiTableComponent,
        RtuiCustomTableCellsDirective,
    ],
})
export class RtuiDynamicListComponent<
    ENTITY_TYPE extends Record<string, unknown>,
    SORT_PROPERTY extends Extract<keyof ENTITY_TYPE, string>,
    KEY extends Extract<keyof ENTITY_TYPE, string>,
> {
    /** Table config storage key */
    public tableConfigStorageKey: InputSignalWithTransform<string, unknown> = input.required<string, unknown>({
        transform: transformStringInput,
    });
    /** Indicates is mobile view */
    public isMobile: InputSignalWithTransform<Nullable<boolean>, BooleanInput> = input<Nullable<boolean>, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is loading in progress */
    public loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is fetching in progress */
    public fetching: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Indicates are table rows clickable */
    public isTableRowsClickable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is pagination shown */
    public isPaginationShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is the refresh button shown */
    public isRefreshButtonShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is a table config button shown */
    public isTableConfigButtonShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is toolbar buttons outlined */
    public isToolbarActionsIconsOutlined: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    /** Key of ENTITY_TYPE for compare entities */
    public keyExp: InputSignal<NonNullable<KEY>> = input('id' as NonNullable<KEY>);
    /** List of entities */
    public entities: InputSignalWithTransform<ENTITY_TYPE[], ENTITY_TYPE[]> = input.required<ENTITY_TYPE[], ENTITY_TYPE[]>({
        transform: (value: ENTITY_TYPE[]) => transformArrayInput(value),
    });

    /** Current page model from store */
    public pageModel: InputSignal<PageModel> = input.required();
    /** Current search term from store */
    public searchTerm: InputSignal<Nullable<string>> = input.required();
    /** Current sort model from store */
    public currentSortModel: InputSignal<Nullable<SortModel<NonNullable<KEY>>>> = input.required();
    /** Inputs appearance */
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

    /** Sort model change output action */
    public readonly sortChange: OutputEmitterRef<SortModel<NonNullable<KEY>>> = output<SortModel<NonNullable<KEY>>>();
    /** Page model change output action */
    public readonly pageModelChange: OutputEmitterRef<Partial<PageModel>> = output<Partial<PageModel>>();
    /** Search change output action */
    public readonly searchChange: OutputEmitterRef<Nullable<string>> = output<Nullable<string>>();
    /** Refresh output action */
    public readonly refresh: OutputEmitterRef<void> = output<void>();
    /** Clear filters output action */
    public readonly clearFiltersAction: OutputEmitterRef<void> = output<void>();
    /** Row click output action */
    public readonly rowClick: OutputEmitterRef<NonNullable<{ row: ENTITY_TYPE; event: MouseEvent }>> =
        output<NonNullable<{ row: ENTITY_TYPE; event: MouseEvent }>>();
    /** Row doubleClick output action */
    public readonly rowDoubleClick: OutputEmitterRef<NonNullable<ENTITY_TYPE>> = output<NonNullable<ENTITY_TYPE>>();
    /** Filter change output action */
    public readonly filterChange: OutputEmitterRef<FilterModel<KEY>[]> = output<FilterModel<KEY>[]>();

    /** Toolbar selectors template */
    public readonly toolbarSelectorsTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(
        RtuiDynamicListToolbarSelectorsDirective,
        {
            read: TemplateRef,
        }
    );
    /** Toolbar actions template */
    public readonly toolbarActionsTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiDynamicListToolbarActionsDirective, {
        read: TemplateRef,
    });
    /** Custom cells template */
    public readonly customCellsTpl: Signal<Nullable<RtuiDynamicListCustomTableCellsDirective<{ $implicit: ENTITY_TYPE }>>> = contentChild(
        RtuiDynamicListCustomTableCellsDirective
    );
    /** Row actions template */
    public readonly rowActionsTpl: Signal<Nullable<TemplateRef<{ $implicit: ENTITY_TYPE }>>> = contentChild(
        RtuiDynamicListRowActionsDirective,
        {
            read: TemplateRef,
        }
    );
    /** Additional row actions template */
    public readonly additionalRowActionsTpl: Signal<Nullable<TemplateRef<{ $implicit: ENTITY_TYPE }>>> = contentChild(
        RtuiDynamicListRowAdditionalActionsDirective,
        {
            read: TemplateRef,
        }
    );

    /** Table container for selectors directive usage */
    public readonly tableContainerTpl: Signal<Nullable<RtuiTableContainerComponent<ENTITY_TYPE>>> =
        viewChild<RtuiTableContainerComponent<ENTITY_TYPE>>(RtuiTableContainerComponent);
    /** Table selector for selectors directive usage */
    public readonly tableTpl: Signal<Nullable<RtuiTableComponent<ENTITY_TYPE, SORT_PROPERTY, KEY>>> =
        viewChild<RtuiTableComponent<ENTITY_TYPE, SORT_PROPERTY, KEY>>(RtuiTableComponent);

    /** Search change output action */
    public onSearchChange(value: Nullable<string>): void {
        this.searchChange.emit(value);
    }

    /** Sort change output action */
    public onSortChange(sortModel: SortModel<NonNullable<KEY>>): void {
        this.sortChange.emit(sortModel);
    }

    /** Page model change output action */
    public onPageModelChange(pageModel: Partial<PageModel>): void {
        this.pageModelChange.emit(pageModel);
    }

    /** Filter change output action */
    public onFilterChange(filterModel: FilterModel<KEY>[]): void {
        this.filterChange.emit(filterModel);
    }

    /** Refresh output action */
    public onRefresh(): void {
        this.refresh.emit();
    }

    /** Clear filters output action */
    public onClearFilters(): void {
        this.clearFiltersAction.emit();
    }

    /** Row click output action */
    public onRowClick({ row, event }: { row: ENTITY_TYPE; event: MouseEvent }): void {
        this.rowClick.emit({ row, event });
    }

    /** Row doubleClick output action */
    public onRowDoubleClick(row: ENTITY_TYPE): void {
        this.rowDoubleClick.emit(row);
    }
}
