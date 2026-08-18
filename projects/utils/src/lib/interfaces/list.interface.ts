export interface IListState<T extends string, M extends object> {
    pageModel: IPageModel;
    sortModel: ISortModel<T>;
    filterModel: M;
    searchTerm: string;
}

export interface ISortModel<T = string> {
    propertyName: T;
    sortDirection: TListSortOrderType;
}

export interface IPageModel {
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

export interface IFilterModel<M = string> {
    operatorType: TFilterOperatorType;
    propertyName: M;
    value?: string | number | boolean;
    values?: Array<string | number>;
}

export enum EFilterOperatorType {
    EQUALS = 'equals',
    NOT_EQUALS = 'notEquals',
    STARTS_WITH = 'startsWith',
    ENDS_WITH = 'endsWith',
    CONTAINS = 'contains',
    GREATER_THAN = 'greaterThan',
    LESS_THAN = 'lessThan',
}

export type TFilterOperatorType =
    | EFilterOperatorType.EQUALS
    | EFilterOperatorType.NOT_EQUALS
    | EFilterOperatorType.STARTS_WITH
    | EFilterOperatorType.ENDS_WITH
    | EFilterOperatorType.CONTAINS
    | EFilterOperatorType.GREATER_THAN
    | EFilterOperatorType.LESS_THAN;

export const FILTER_OPERATORS: ReadonlyArray<TFilterOperatorType> = Object.freeze([
    EFilterOperatorType.EQUALS,
    EFilterOperatorType.NOT_EQUALS,
    EFilterOperatorType.STARTS_WITH,
    EFilterOperatorType.ENDS_WITH,
    EFilterOperatorType.CONTAINS,
    EFilterOperatorType.GREATER_THAN,
    EFilterOperatorType.LESS_THAN,
]);

export enum EListSortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export type TListSortOrderType = EListSortOrder.ASC | EListSortOrder.DESC;
