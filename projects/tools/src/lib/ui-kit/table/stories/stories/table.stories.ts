import { provideAnimations } from '@angular/platform-browser/animations';

import { Meta, StoryObj, applicationConfig } from '@storybook/angular';

import { LIST_SORT_ORDER_ENUM } from '../../util/list-sort-order.enum';
import { createPersonList } from '../mocks';
import TestTableComponent from '../table/test-table-component';
import { Person } from '../types';

const data: Person[] = createPersonList(20);
const selectedEntitiesIds: number[] = [data[0].id, data[3].id];

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

export const ManyItems: Story = {
    args: {
        isMultiSelect: true,
        isSelectorsColumnShown: true,
        isSelectorsColumnDisabled: false,
        isMobile: false,
        data: data,
        selectedEntitiesIds,
        sortModel: {
            propertyName: 'id',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
    },
};

export const FewItems: Story = {
    args: {
        isMultiSelect: true,
        isSelectorsColumnShown: true,
        isSelectorsColumnDisabled: false,
        isMobile: false,
        data: createPersonList(5),
        sortModel: {
            propertyName: 'id',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
    },
};
