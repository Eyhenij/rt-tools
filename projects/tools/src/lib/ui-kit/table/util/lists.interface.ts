import { ListSortOrderType } from './list-sort-order.enum';

export interface ListState<T, M> {
    pageModel: PageModel;
    sortModel: SortModel<T>;
    filterModel: M;
    searchTerm: string;
}

export interface SortModel<T> {
    propertyName: T;
    sortDirection: ListSortOrderType;
}

export interface PageModel {
    pageNumber: number;
    pageSize: number;
    totalCount: number;

    endIndex?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
    isFirstPage?: boolean;
    isLastPage?: boolean;
    startIndex?: number;
}

export interface FilterModel<M> {
    operatorType: FilterOperatorType;
    propertyName: M;
    value: string | number | boolean;
}

export enum FILTER_OPERATOR_TYPE_ENUM {
    EQUALS = 'equals',
    STARTS_WITH = 'startsWith',
    ENDS_WITH = 'endsWith',
    CONTAINS = 'contains',
    GREATER_THAN = 'greaterThan',
    LESS_THAN = 'lessThan',
}

export type FilterOperatorType =
    | FILTER_OPERATOR_TYPE_ENUM.EQUALS
    | FILTER_OPERATOR_TYPE_ENUM.STARTS_WITH
    | FILTER_OPERATOR_TYPE_ENUM.ENDS_WITH
    | FILTER_OPERATOR_TYPE_ENUM.CONTAINS
    | FILTER_OPERATOR_TYPE_ENUM.GREATER_THAN
    | FILTER_OPERATOR_TYPE_ENUM.LESS_THAN;
