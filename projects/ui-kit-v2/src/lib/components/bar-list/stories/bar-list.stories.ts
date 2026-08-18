import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtBarListComponent } from './component/test-bar-list.component';

export default {
    title: 'Components/BarList',
    component: TestRtBarListComponent,
    argTypes: {
        rows: { control: false },
        title: { control: { type: 'text' } },
        emptyText: { control: { type: 'text' } },
    },
} as Meta<TestRtBarListComponent>;

type TStory = StoryObj<TestRtBarListComponent>;

export const Default: TStory = {
    parameters: storySnapshotSkip(
        'обёртка отдаёт пустой `rows`, и вместо списка в кадре пустое состояние; пустой показ покрытием не считается, наполнение — волна покрытия составных компонентов'
    ),
    args: {
        rows: [],
        title: 'Заголовок',
        emptyText: 'Ничего не найдено',
    },
};
