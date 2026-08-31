import { Meta, StoryObj } from '@storybook/angular';

import { EListSortOrder } from '@rt-tools/utils';
import { createPersonList } from '../mocks';
import TestTableComponent from '../table/test-table-component';
import { TPerson } from '../types';

const manyItems: TPerson[] = createPersonList(20);
const fewItems: TPerson[] = createPersonList(11);

export default {
    title: 'Components/Table',
    component: TestTableComponent,
} as Meta<TestTableComponent>;

type TStory = StoryObj<TestTableComponent>;

export const ManyItems: TStory = {
    args: {
        isMultiSelect: true,
        isSelectorsColumnShown: true,
        isSelectorsColumnDisabled: false,
        data: manyItems,
        selectedEntitiesIds: [manyItems[0].id, manyItems[3].id],
        sortModel: {
            propertyName: 'id',
            sortDirection: EListSortOrder.ASC,
        },
    },
};

/**
 * Кнопка копирования под наведением. Она есть в разметке каждой копируемой ячейки, но до
 * наведения скрыта — в снимок остальных историй попадает пустое место, а не её оформление.
 */
export const CopyButtonOnHover: TStory = {
    args: {
        isMultiSelect: false,
        isSelectorsColumnShown: true,
        isSelectorsColumnDisabled: false,
        data: fewItems,
        sortModel: {
            propertyName: 'id',
            sortDirection: EListSortOrder.ASC,
        },
    },
    parameters: { snapshotHover: 'rtui-table-base-cell:has(.base-cell__copy-button)' },
};

export const FewItems: TStory = {
    args: {
        isMultiSelect: false,
        isSelectorsColumnShown: true,
        isSelectorsColumnDisabled: false,
        data: fewItems,
        selectedEntitiesIds: [fewItems[1].id],
        sortModel: {
            propertyName: 'id',
            sortDirection: EListSortOrder.ASC,
        },
    },
};
