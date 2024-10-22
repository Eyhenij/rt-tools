import { provideAnimations } from '@angular/platform-browser/animations';

import { Meta, StoryObj, applicationConfig } from '@storybook/angular';

import { LIST_SORT_ORDER_ENUM } from '../../util/list-sort-order.enum';
import TestDynamicListComponent from '../dynamic-list/test-dynamic-list.component';
import { createPersonList } from '../mocks';
import { Person } from '../types';

const data: Person[] = createPersonList(20);
const selectedEntitiesIds: number[] = [data[0].id, data[3].id];

export default {
    title: 'Components/DynamicList',
    component: TestDynamicListComponent,
    decorators: [
        applicationConfig({
            providers: [provideAnimations()],
        }),
    ],
} as Meta<TestDynamicListComponent>;

type Story = StoryObj<TestDynamicListComponent>;

export const ManyItems: Story = {
    args: {
        isMobile: false,
        loading: false,
        fetching: false,
        isMultiSelect: true,
        isSelectAllSelectorShown: true,
        isSelectorsColumnDisabled: false,
        isRefreshButtonShown: true,
        isTableRowsClickable: true,
        data: data,
        selectedEntitiesIds: selectedEntitiesIds,
        pageModel: {
            pageNumber: 1,
            pageSize: 10,
            totalCount: 20,
            hasPrev: false,
            hasNext: true,
        },
        currentSortModel: {
            propertyName: 'id',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
        searchTerm: 'fgddfg',
    },
};

export const FewItems: Story = {
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
        data: createPersonList(11),
        selectedEntitiesIds: [],
        pageModel: {
            pageNumber: 1,
            pageSize: 20,
            totalCount: 12,
        },
        currentSortModel: {
            propertyName: 'id',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
        searchTerm: '',
    },
};

export const NoItems: Story = {
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
        data: [],
        selectedEntitiesIds: [],
        pageModel: {
            pageNumber: 1,
            pageSize: 10,
            totalCount: 0,
        },
        currentSortModel: {
            propertyName: 'id',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
        searchTerm: '',
    },
};
