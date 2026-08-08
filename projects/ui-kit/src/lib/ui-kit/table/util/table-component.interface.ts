import { InjectionToken, Signal, TemplateRef, WritableSignal } from '@angular/core';
import { MatFormFieldAppearance } from '@angular/material/form-field';

import { INullable } from '@rt-tools/utils';
import { IFilterModel, ISortModel } from '@rt-tools/utils';
import { ITable } from './table-column.interface';

export const RTUI_TABLE_COMPONENT_TOKEN: InjectionToken<IRtuiTable<Record<string, unknown>, string, string>> = new InjectionToken<
    IRtuiTable<Record<string, unknown>, Extract<keyof Record<string, unknown>, string>, Extract<keyof Record<string, unknown>, string>>
>('RtuiTableComponent');

export interface IRtuiTable<
    ENTITY_TYPE extends Record<string, unknown>,
    SORT_PROPERTY extends Extract<keyof ENTITY_TYPE, string>,
    KEY extends Extract<keyof ENTITY_TYPE, string>,
> {
    columns: Signal<Array<ITable.Column<ENTITY_TYPE>>>;
    customCellsTpl: Signal<
        INullable<{
            getTemplateByPropName(propName: keyof ENTITY_TYPE): TemplateRef<{ $implicit: ENTITY_TYPE }>;
        }>
    >;
    rowActionsTpl: Signal<INullable<TemplateRef<{ $implicit: ENTITY_TYPE }>>>;
    additionalRowActionsTpl: Signal<INullable<TemplateRef<unknown>>>;

    narrow: Signal<boolean>;
    isTableRowsClickable: Signal<boolean>;
    keyExp: Signal<NonNullable<KEY>>;
    entities: Signal<ENTITY_TYPE[]>;
    currentSortModel: Signal<INullable<ISortModel<SORT_PROPERTY>>>;
    appearance: Signal<MatFormFieldAppearance>;
    filterAppearance: Signal<MatFormFieldAppearance>;
    filterModel: Signal<IFilterModel<KEY>[]>;
    isFiltersShown: Signal<boolean>;
    selectedEntitiesIds: WritableSignal<ENTITY_TYPE[KEY][]>;
    isPageEntitiesSelected: WritableSignal<boolean>;
    isPageEntitiesIndeterminate: WritableSignal<boolean>;
    isMultiSelect: WritableSignal<boolean>;
    isSelectorsColumnShown: WritableSignal<boolean>;
    isSelectorsColumnDisabled: WritableSignal<boolean>;
    activeRowIndex: WritableSignal<INullable<number>>;

    onSortChange(sortModel: ISortModel): void;
    onFilterChange(filterModel: IFilterModel<KEY>[]): void;
    onMenuOpen(index: number): void;
    onMenuClose(): void;
    onRowClick(row: ENTITY_TYPE, event: MouseEvent): void;
    onRowDoubleClick(row: ENTITY_TYPE): void;
    onToggleEntity(entity: ENTITY_TYPE, checked: boolean): void;
    onTogglePageEntities(checked: boolean): void;
}
