import { provideAnimations } from '@angular/platform-browser/animations';

import { Meta, StoryObj, applicationConfig } from '@storybook/angular';

import { LIST_SORT_ORDER_ENUM } from '../../util/list-sort-order.enum';
import { COLUMNS } from '../constants';
import TestDynamicListComponent from '../dynamic-list/test-dynamic-list.component';
import { createPersonList } from '../mocks';

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

export const ManyColumns: Story = {
    args: {
        isMobile: false,
        loading: false,
        fetching: false,
        isSelectorsShown: true,
        isSelectorsColumnDisabled: false,
        isMultiSelect: true,
        isAllEntitiesSelected: false,
        isTableRowsClickable: true,
        data: createPersonList(20),
        columns: COLUMNS,
        selectedEntitiesKeys: [],
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

export const FewColumns: Story = {
    args: {
        isMobile: false,
        loading: false,
        fetching: false,
        isSelectorsShown: true,
        isSelectorsColumnDisabled: false,
        isMultiSelect: true,
        isAllEntitiesSelected: false,
        isTableRowsClickable: true,
        data: createPersonList(20),
        columns: COLUMNS.slice(0, 2),
        selectedEntitiesKeys: [],
        pageModel: {
            pageNumber: 1,
            pageSize: 10,
            totalCount: 20,
            hasPrev: true,
            hasNext: true,
        },
        currentSortModel: {
            propertyName: 'id',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
        searchTerm: '',
    },
};

export const FewItems: Story = {
    args: {
        isMobile: false,
        loading: false,
        fetching: false,
        isSelectorsShown: true,
        isSelectorsColumnDisabled: false,
        isMultiSelect: true,
        isAllEntitiesSelected: false,
        isTableRowsClickable: true,
        data: createPersonList(11),
        columns: COLUMNS.slice(0, 5),
        selectedEntitiesKeys: [],
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
        isSelectorsShown: true,
        isSelectorsColumnDisabled: false,
        isMultiSelect: true,
        isAllEntitiesSelected: false,
        isTableRowsClickable: true,
        data: [],
        columns: COLUMNS.slice(0, 5),
        selectedEntitiesKeys: [],
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
