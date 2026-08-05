import { Meta, StoryObj } from '@storybook/angular';

import { TestRtCardComponent } from './component/test-card.component';

export default {
    title: 'Components/Card',
    component: TestRtCardComponent,
    argTypes: {
        header: { control: { type: 'text' } },
        ariaLabel: { control: { type: 'text' } },
        clickable: { control: { type: 'boolean' } },
    },
} as Meta<TestRtCardComponent>;

type Story = StoryObj<TestRtCardComponent>;

export const Default: Story = {
    args: {
        header: null,
        ariaLabel: null,
        clickable: false,
    },
};
