import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../../showcase';
import { TestRtTableSortHeaderComponent } from './component/test-table-sort-header.component';

export default {
    title: 'Organisms/Table/TableSortHeader',
    component: TestRtTableSortHeaderComponent,
    argTypes: {
        rtSortHeader: { control: { type: 'text' } },
    },
} as Meta<TestRtTableSortHeaderComponent>;

type TStory = StoryObj<TestRtTableSortHeaderComponent>;

/** Ключ колонки — тот же, что двойник таблицы объявил сортируемым: пустой ключ рисует подпись без кнопки. */
export const Playground: TStory = {
    parameters: storySnapshotSkip(
        'подпись заголовок берёт из проекции, а обёртка её не отдаёт: в кадре пустая страница; пустой показ покрытием не считается, наполнение — волна покрытия составных компонентов'
    ),
    args: {
        rtSortHeader: 'name',
    },
};
