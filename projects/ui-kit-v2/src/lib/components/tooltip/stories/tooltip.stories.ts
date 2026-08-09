import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtTooltipComponent } from './component/test-tooltip.component';

export default {
    title: 'Components/Tooltip',
    component: TestRtTooltipComponent,
    argTypes: {
        text: { control: { type: 'text' } },
        placement: {
            options: ['top', 'bottom'],
            control: { type: 'select' },
        },
    },
} as Meta<TestRtTooltipComponent>;

type Story = StoryObj<TestRtTooltipComponent>;

export const Playground: Story = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        text: 'Текст подсказки',
        placement: 'top',
    },
};
