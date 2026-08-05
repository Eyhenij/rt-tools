import { Meta, StoryObj } from '@storybook/angular';

import { TestRtButtonComponent } from './component/test-button.component';

export default {
    title: 'Components/Button',
    component: TestRtButtonComponent,
    argTypes: {
        label: { control: { type: 'text' } },
        icon: { control: { type: 'text' } },
        iconPos: {
            options: ['left', 'right'],
            control: { type: 'select' },
        },
        theme: {
            options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info'],
            control: { type: 'select' },
        },
        appearance: {
            options: ['filled', 'outlined', 'text'],
            control: { type: 'select' },
        },
        size: {
            options: ['sm', 'md', 'lg'],
            control: { type: 'select' },
        },
        rounded: { control: { type: 'boolean' } },
        loading: { control: { type: 'boolean' } },
        loadingIcon: { control: { type: 'text' } },
    },
} as Meta<TestRtButtonComponent>;

type Story = StoryObj<TestRtButtonComponent>;

export const Default: Story = {
    args: {
        label: 'Сохранить',
        icon: null,
        iconPos: 'left',
        theme: 'primary',
        appearance: 'filled',
        size: 'md',
        rounded: false,
        loading: false,
        loadingIcon: null,
    },
};
