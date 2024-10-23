import { provideAnimations } from '@angular/platform-browser/animations';

import { Meta, StoryObj, applicationConfig } from '@storybook/angular';

import { LIST_SORT_ORDER_ENUM } from '../../util/list-sort-order.enum';
import { createPersonList } from '../mocks';
import TestTableComponent from '../table/test-table-component';
import { Person } from '../types';

const manyItems: Person[] = createPersonList(20);
const fewItems: Person[] = createPersonList(11);

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
        data: manyItems,
        selectedEntitiesIds: [manyItems[0].id, manyItems[3].id],
        sortModel: {
            propertyName: 'id',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
    },
};

export const FewItems: Story = {
    args: {
        isMultiSelect: false,
        isSelectorsColumnShown: true,
        isSelectorsColumnDisabled: false,
        isMobile: false,
        data: fewItems,
        selectedEntitiesIds: [fewItems[1].id],
        sortModel: {
            propertyName: 'id',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
    },
};
