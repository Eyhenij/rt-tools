import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtEmptyStateComponent } from './component/test-empty-state.component';

export default {
    title: 'Components/EmptyState',
    component: TestRtEmptyStateComponent,
    argTypes: {
        icon: { control: false },
        title: { control: { type: 'text' } },
        description: { control: { type: 'text' } },
    },
} as Meta<TestRtEmptyStateComponent>;

type Story = StoryObj<TestRtEmptyStateComponent>;

export const Playground: Story = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        icon: null,
        title: 'Заголовок',
        description: 'Пояснение к полю',
    },
};
