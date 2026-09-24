import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDataListFirstKitComponent } from './component/test-data-list-first-kit.component';
import { TEST_PEOPLE } from './component/test-data-list-people';

/**
 * Весь список с тем же наполнением, что у истории списка первого кита на его витрине: многими
 * записями, немногими и без записей. Две витрины кладут рядом и сравнивают.
 *
 * Вид первого кита список ставит на себя сам и отдаёт его боковой панели и меню строки, которые
 * открываются поверх страницы. Витрина добавляет только фиолетовую тему первого кита.
 */
export default {
    title: 'Organisms/Material Dynamic List/DataList',
    component: TestRtDataListFirstKitComponent,
    globals: { preset: 'first-kit-theme' },
    argTypes: {
        rows: { control: false },
        page: { control: false },
        selectedIds: { control: false },
    },
} as Meta<TestRtDataListFirstKitComponent>;

type TStory = StoryObj<TestRtDataListFirstKitComponent>;

const FEW: typeof TEST_PEOPLE = TEST_PEOPLE.slice(0, 11);

export const ManyItems: TStory = {
    args: {
        caption: 'Много записей, как у первого кита',
        storageKey: 'story-list-first-kit-many',
        rows: TEST_PEOPLE,
        page: { pageNumber: 1, pageSize: 10, totalCount: 20, hasPrev: false, hasNext: true },
        selectedIds: [TEST_PEOPLE[0].id, TEST_PEOPLE[3].id],
        filtersShown: true,
        multiSelect: true,
    },
};

export const FewItems: TStory = {
    args: {
        caption: 'Немного записей, как у первого кита',
        storageKey: 'story-list-first-kit-few',
        rows: FEW,
        page: { pageNumber: 1, pageSize: 20, totalCount: 12, hasPrev: false, hasNext: false },
        selectedIds: [FEW[1].id],
        filtersShown: false,
        multiSelect: false,
    },
};

export const NoItems: TStory = {
    args: {
        caption: 'Без записей, как у первого кита',
        storageKey: 'story-list-first-kit-none',
        rows: [],
        page: { pageNumber: 1, pageSize: 20, totalCount: 0, hasPrev: false, hasNext: false },
        selectedIds: [],
        filtersShown: false,
        multiSelect: false,
    },
};
