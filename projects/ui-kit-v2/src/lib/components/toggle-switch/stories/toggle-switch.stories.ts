import { Meta, StoryObj } from '@storybook/angular';

import { TestRtToggleSwitchComponent } from './component/test-toggle-switch.component';

export default {
    title: 'Components/ToggleSwitch',
    component: TestRtToggleSwitchComponent,
    argTypes: {
        inputId: { control: { type: 'text' } },
        ariaLabel: { control: { type: 'text' } },
        size: {
            options: ['sm', 'md', 'lg'],
            control: { type: 'select' },
        },
        iconOff: { control: false },
        iconOn: { control: false },
        disabled: { control: { type: 'boolean' } },
    },
} as Meta<TestRtToggleSwitchComponent>;

type Story = StoryObj<TestRtToggleSwitchComponent>;

export const Playground: Story = {
    args: {
        inputId: null,
        ariaLabel: null,
        size: 'sm',
        iconOff: null,
        iconOn: null,
        disabled: false,
    },
};
