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

export const Default: Story = {
    args: {
        text: 'Текст',
        placement: 'top',
    },
};
