import { Meta, StoryObj } from '@storybook/angular';

import { TestRtCounterComponent } from './component/test-counter.component';

export default {
    title: 'Components/Counter',
    component: TestRtCounterComponent,
    argTypes: {
        ariaLabel: { control: { type: 'text' } },
        min: { control: { type: 'number' } },
        max: { control: { type: 'number' } },
        step: { control: { type: 'number' } },
        decreaseLabel: { control: { type: 'text' } },
        increaseLabel: { control: { type: 'text' } },
        disabled: { control: { type: 'boolean' } },
    },
} as Meta<TestRtCounterComponent>;

type Story = StoryObj<TestRtCounterComponent>;

export const Default: Story = {
    args: {
        ariaLabel: null,
        min: 0,
        max: Number.MAX_SAFE_INTEGER,
        step: 1,
        decreaseLabel: '',
        increaseLabel: '',
        disabled: false,
    },
};
