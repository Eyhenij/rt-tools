import { ListSortOrderType } from './list-sort-order.enum';

export interface ListState<T extends string, M extends object> {
    pageModel: PageModel;
    sortModel: SortModel<T>;
    filterModel: M;
    searchTerm: string;
}

export interface SortModel<T = string> {
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

export interface FilterModel<M = string> {
    operatorType: FilterOperatorType;
    propertyName: M;
    value?: string | number | boolean;
    values?: Array<string | number>;
}

export enum FILTER_OPERATOR_TYPE_ENUM {
    EQUALS = 'equals',
    NOT_EQUALS = 'notEquals',
    STARTS_WITH = 'startsWith',
    ENDS_WITH = 'endsWith',
    CONTAINS = 'contains',
    GREATER_THAN = 'greaterThan',
    LESS_THAN = 'lessThan',
}

export type FilterOperatorType =
    | FILTER_OPERATOR_TYPE_ENUM.EQUALS
    | FILTER_OPERATOR_TYPE_ENUM.NOT_EQUALS
    | FILTER_OPERATOR_TYPE_ENUM.STARTS_WITH
    | FILTER_OPERATOR_TYPE_ENUM.ENDS_WITH
    | FILTER_OPERATOR_TYPE_ENUM.CONTAINS
    | FILTER_OPERATOR_TYPE_ENUM.GREATER_THAN
    | FILTER_OPERATOR_TYPE_ENUM.LESS_THAN;

export const FILTER_OPERATORS: ReadonlyArray<FilterOperatorType> = Object.freeze([
    FILTER_OPERATOR_TYPE_ENUM.EQUALS,
    FILTER_OPERATOR_TYPE_ENUM.NOT_EQUALS,
    FILTER_OPERATOR_TYPE_ENUM.STARTS_WITH,
    FILTER_OPERATOR_TYPE_ENUM.ENDS_WITH,
    FILTER_OPERATOR_TYPE_ENUM.CONTAINS,
    FILTER_OPERATOR_TYPE_ENUM.GREATER_THAN,
    FILTER_OPERATOR_TYPE_ENUM.LESS_THAN,
]);
