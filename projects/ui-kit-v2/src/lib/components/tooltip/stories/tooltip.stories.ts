import { Meta, StoryObj } from '@storybook/angular';

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
    args: {
        text: 'Текст подсказки',
        placement: 'top',
    },
};
