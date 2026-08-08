import { provideAnimations } from '@angular/platform-browser/animations';

import { Meta, StoryObj, applicationConfig } from '@storybook/angular';

import { LIST_SORT_ORDER_ENUM } from '@rt-tools/utils';
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

/**
 * Кнопка копирования под наведением. Она есть в разметке каждой копируемой ячейки, но до
 * наведения скрыта — в снимок остальных историй попадает пустое место, а не её оформление.
 */
export const CopyButtonOnHover: Story = {
    args: {
        isMultiSelect: false,
        isSelectorsColumnShown: true,
        isSelectorsColumnDisabled: false,
        isMobile: false,
        data: fewItems,
        sortModel: {
            propertyName: 'id',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
    },
    parameters: { snapshotHover: 'rtui-table-base-cell:has(.base-cell__copy-button)' },
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
