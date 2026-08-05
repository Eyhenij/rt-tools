import { Meta, StoryObj } from '@storybook/angular';

import { TestRtIconButtonComponent } from './component/test-icon-button.component';

export default {
    title: 'Components/IconButton',
    component: TestRtIconButtonComponent,
    argTypes: {
        icon: { control: false },
        ariaLabel: { control: { type: 'text' } },
        variant: {
            options: ['primary', 'secondary', 'ghost', 'danger', 'success', 'warning'],
            control: { type: 'select' },
        },
        iconColor: {
            options: ['current', 'muted', 'info', 'success', 'warning', 'danger', 'inverse'],
            control: { type: 'select' },
        },
        size: {
            options: ['sm', 'md', 'lg'],
            control: { type: 'select' },
        },
        iconSize: { control: false },
        shape: {
            options: ['circle', 'square'],
            control: { type: 'select' },
        },
        type: {
            options: ['button', 'submit'],
            control: { type: 'select' },
        },
        tooltip: { control: { type: 'text' } },
        tabIndex: { control: { type: 'number' } },
        loading: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
        active: { control: { type: 'boolean' } },
        indicator: { control: { type: 'boolean' } },
    },
} as Meta<TestRtIconButtonComponent>;

type Story = StoryObj<TestRtIconButtonComponent>;

export const Default: Story = {
    args: {
        icon: 'alarm-clock',
        ariaLabel: '',
        variant: 'ghost',
        iconColor: 'current',
        size: 'md',
        iconSize: null,
        shape: 'square',
        type: 'button',
        tooltip: '',
        tabIndex: 0,
        loading: false,
        disabled: false,
        active: false,
        indicator: false,
    },
};
