import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtContainerComponent } from './component/test-container.component';

export default {
    title: 'Components/Container',
    component: TestRtContainerComponent,
    argTypes: {
        mobileLeftNav: {
            options: ['keep', 'bottom'],
            control: { type: 'select' },
        },
        height: {
            options: ['auto', 'viewport'],
            control: { type: 'select' },
        },
    },
} as Meta<TestRtContainerComponent>;

type Story = StoryObj<TestRtContainerComponent>;

export const Playground: Story = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        mobileLeftNav: 'keep',
        height: 'auto',
    },
};
