import { provideAnimations } from '@angular/platform-browser/animations';

import { Meta, StoryObj, applicationConfig } from '@storybook/angular';

import { LIST_SORT_ORDER_ENUM } from '../../util/list-sort-order.enum';
import TestDynamicListComponent from '../dynamic-list/test-dynamic-list.component';
import { createPersonList } from '../mocks';
import { Person } from '../types';

const manyItems: Person[] = createPersonList(20);
const fewItems: Person[] = createPersonList(11);

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
        isMultiSelect: false,
        isAllEntitiesSelected: false,
        isTableRowsClickable: true,
        data: fewItems,
        selectedEntitiesIds: [fewItems[1].id],
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
