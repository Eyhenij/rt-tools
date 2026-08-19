import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtCounterRowComponent } from './component/test-counter-row.component';

export default {
    title: 'Molecules/Forms/CounterRow',
    component: TestRtCounterRowComponent,
    argTypes: {
        label: { control: { type: 'text' } },
        hint: { control: { type: 'text' } },
    },
} as Meta<TestRtCounterRowComponent>;

type TStory = StoryObj<TestRtCounterRowComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        label: 'Сохранить',
        hint: 'Подсказка',
    },
};
