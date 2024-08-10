import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { LIST_SORT_ORDER_ENUM } from '../../util/list-sort-order.enum';
import { COLUMNS } from '../constants';
import TestDynamicListComponent from '../dynamic-list/test-dynamic-list.component';
import { createPersonList } from '../mocks';

export default {
    title: 'Components/DynamicList',
    component: TestDynamicListComponent,
    decorators: [
        moduleMetadata({
            imports: [BrowserAnimationsModule],
        }),
    ],
} as Meta<TestDynamicListComponent>;

type Story = StoryObj<TestDynamicListComponent>;

export const ManyColumns: Story = {
    args: {
        isMobile: false,
        loading: false,
        fetching: false,
        isSelectorShown: true,
        isAllEntitiesSelected: false,
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
        isSelectorShown: true,
        isAllEntitiesSelected: false,
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
        isSelectorShown: true,
        isAllEntitiesSelected: false,
        data: createPersonList(5),
        columns: COLUMNS.slice(0, 5),
        selectedEntitiesKeys: [],
        pageModel: {
            pageNumber: 1,
            pageSize: 10,
            totalCount: 5,
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
        isSelectorShown: true,
        isAllEntitiesSelected: false,
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
