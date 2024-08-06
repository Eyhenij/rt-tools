import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { LIST_SORT_ORDER_ENUM } from '../util/list-sort-order.enum';
import TestTableComponent from './component/test-table-component';
import { COLUMNS } from './constants';
import { createPersonList } from './mocks';

export default {
    title: 'Components/Table',
    component: TestTableComponent,
    decorators: [
        moduleMetadata({
            imports: [BrowserAnimationsModule],
        }),
    ],
} as Meta<TestTableComponent>;

type Story = StoryObj<TestTableComponent>;

export const ManyColumns: Story = {
    args: {
        isMobile: false,
        data: createPersonList(20),
        columns: COLUMNS,
        pageModel: {
            pageNumber: 1,
            pageSize: 10,
            totalCount: 20,
        },
        sortModel: {
            propertyName: 'id',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
    },
};

export const FewColumns: Story = {
    args: {
        isMobile: false,
        data: createPersonList(20),
        columns: COLUMNS.slice(0, 5),
        pageModel: {
            pageNumber: 1,
            pageSize: 10,
            totalCount: 20,
        },
        sortModel: {
            propertyName: 'id',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
    },
};

export const FewItems: Story = {
    args: {
        isMobile: false,
        data: createPersonList(5),
        columns: COLUMNS.slice(0, 5),
        pageModel: {
            pageNumber: 1,
            pageSize: 10,
            totalCount: 5,
        },
        sortModel: {
            propertyName: 'id',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
    },
};
