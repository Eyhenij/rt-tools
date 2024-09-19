import { provideAnimations } from '@angular/platform-browser/animations';

import { Meta, StoryObj, applicationConfig } from '@storybook/angular';

import { LIST_SORT_ORDER_ENUM } from '../../util/list-sort-order.enum';
import { COLUMNS } from '../constants';
import { createPersonList } from '../mocks';
import TestTableComponent from '../table/test-table-component';

export default {
    title: 'Components/Table',
    component: TestTableComponent,
    decorators: [
        applicationConfig({
            providers: [provideAnimations()],
        }),
    ],
} as Meta<TestTableComponent>;

type Story = StoryObj<TestTableComponent>;

export const ManyColumns: Story = {
    args: {
        isMobile: false,
        data: createPersonList(20),
        columns: COLUMNS,
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
        columns: COLUMNS.slice(0, 2),
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
        sortModel: {
            propertyName: 'id',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
    },
};
