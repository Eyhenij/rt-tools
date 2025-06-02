import { InjectionToken, Signal, TemplateRef, WritableSignal } from '@angular/core';
import { MatFormFieldAppearance } from '@angular/material/form-field';

import { Nullable } from '../../../util';
import { FilterModel, ITable, SortModel } from './index';

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
        Nullable<{
            getTemplateByPropName(propName: keyof ENTITY_TYPE): TemplateRef<{ $implicit: ENTITY_TYPE }>;
        }>
    >;
    rowActionsTpl: Signal<Nullable<TemplateRef<{ $implicit: ENTITY_TYPE }>>>;
    additionalRowActionsTpl: Signal<Nullable<TemplateRef<unknown>>>;

    isMobile: Signal<boolean>;
    isTableRowsClickable: Signal<boolean>;
    keyExp: Signal<NonNullable<KEY>>;
    entities: Signal<ENTITY_TYPE[]>;
    currentSortModel: Signal<Nullable<SortModel<SORT_PROPERTY>>>;
    appearance: Signal<MatFormFieldAppearance>;
    filterAppearance: Signal<MatFormFieldAppearance>;
    filterModel: Signal<FilterModel<KEY>[]>;
    isFiltersShown: Signal<boolean>;
    selectedEntitiesIds: WritableSignal<ENTITY_TYPE[KEY][]>;
    isPageEntitiesSelected: WritableSignal<boolean>;
    isPageEntitiesIndeterminate: WritableSignal<boolean>;
    isMultiSelect: WritableSignal<boolean>;
    isSelectorsColumnShown: WritableSignal<boolean>;
    isSelectorsColumnDisabled: WritableSignal<boolean>;
    activeRowIndex: WritableSignal<Nullable<number>>;

    onSortChange(sortModel: SortModel): void;
    onFilterChange(filterModel: FilterModel<KEY>[]): void;
    onMenuOpen(index: number): void;
    onMenuClose(): void;
    onRowClick(row: ENTITY_TYPE, event: MouseEvent): void;
    onRowDoubleClick(row: ENTITY_TYPE): void;
    onToggleEntity(entity: ENTITY_TYPE, checked: boolean): void;
    onTogglePageEntities(checked: boolean): void;
}
