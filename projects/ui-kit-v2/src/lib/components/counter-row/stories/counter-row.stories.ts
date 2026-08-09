import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtCounterRowComponent } from './component/test-counter-row.component';

export default {
    title: 'Components/CounterRow',
    component: TestRtCounterRowComponent,
    argTypes: {
        label: { control: { type: 'text' } },
        hint: { control: { type: 'text' } },
    },
} as Meta<TestRtCounterRowComponent>;

type Story = StoryObj<TestRtCounterRowComponent>;

export const Playground: Story = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        label: 'Сохранить',
        hint: 'Подсказка',
    },
};
