import { Meta, StoryObj } from '@storybook/angular';

import { EListSortOrder } from '@rt-tools/utils';
import TestDynamicListComponent from '../dynamic-list/test-dynamic-list.component';
import { createPersonList } from '../mocks';
import { TPerson } from '../types';

const manyItems: TPerson[] = createPersonList(20);
const fewItems: TPerson[] = createPersonList(11);

export default {
    title: 'Components/DynamicList',
    component: TestDynamicListComponent,
} as Meta<TestDynamicListComponent>;

type TStory = StoryObj<TestDynamicListComponent>;

export const ManyItems: TStory = {
    args: {
        isMobile: false,
        loading: false,
        fetching: false,
        isMultiSelect: true,
        isSelectAllSelectorShown: true,
        isSelectorsColumnDisabled: false,
        isRefreshButtonShown: true,
        isTableRowsClickable: true,
        isFiltersShown: true,
        data: manyItems,
        selectedEntitiesIds: [manyItems[0].id, manyItems[3].id],
        pageModel: {
            pageNumber: 1,
            pageSize: 10,
            totalCount: 20,
            hasPrev: false,
            hasNext: true,
        },
        currentSortModel: {
            propertyName: 'id',
            sortDirection: EListSortOrder.ASC,
        },
        searchTerm: 'fgddfg',
    },
};

export const FewItems: TStory = {
    args: {
        isMobile: false,
        loading: false,
        fetching: false,
        isRefreshButtonShown: true,
        isSelectorsShown: true,
        isSelectorsColumnDisabled: false,
        isMultiSelect: false,
        isAllEntitiesSelected: false,
        isTableRowsClickable: true,
        isFiltersShown: false,
        data: fewItems,
        selectedEntitiesIds: [fewItems[1].id],
        pageModel: {
            pageNumber: 1,
            pageSize: 20,
            totalCount: 12,
        },
        currentSortModel: {
            propertyName: 'id',
            sortDirection: EListSortOrder.ASC,
        },
        searchTerm: '',
    },
};

export const NoItems: TStory = {
    args: {
        isMobile: false,
        loading: false,
        fetching: false,
        isRefreshButtonShown: true,
        isSelectorsShown: true,
        isSelectorsColumnDisabled: false,
        isMultiSelect: true,
        isAllEntitiesSelected: false,
        isTableRowsClickable: true,
        isFiltersShown: false,
        data: [],
        selectedEntitiesIds: [],
        pageModel: {
            pageNumber: 1,
            pageSize: 10,
            totalCount: 0,
        },
        currentSortModel: {
            propertyName: 'id',
            sortDirection: EListSortOrder.ASC,
        },
        searchTerm: '',
    },
};
