import { Meta, StoryObj } from '@storybook/angular';

import { BAR_LIST_ROWS } from './component/bar-list.fixture';
import { TestRtBarListComponent } from './component/test-bar-list.component';

export default {
    title: 'Molecules/Data/BarList',
    component: TestRtBarListComponent,
    argTypes: {
        rows: { control: false },
        title: { control: { type: 'text' } },
        emptyText: { control: { type: 'text' } },
    },
} as Meta<TestRtBarListComponent>;

type TStory = StoryObj<TestRtBarListComponent>;

export const Default: TStory = {
    // Показ рисует не сетка витрины: компонент занимает всю ширину сам. Отсюда кадр целой страницей.
    parameters: { snapshot: { fullPage: true } },
    args: {
        rows: BAR_LIST_ROWS,
        title: 'Заголовок',
        emptyText: 'Ничего не найдено',
    },
};
