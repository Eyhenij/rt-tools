import { Meta, StoryObj } from '@storybook/angular';

import { TestRtInputComponent } from './component/test-input.component';

export default {
    title: 'Components/Input',
    component: TestRtInputComponent,
    argTypes: {
        type: {
            options: ['text', 'password', 'email', 'time'],
            control: { type: 'select' },
        },
        placeholder: { control: { type: 'text' } },
        iconLeft: { control: false },
        iconRight: { control: false },
        passwordToggle: { control: { type: 'boolean' } },
        autocomplete: { control: { type: 'text' } },
    },
} as Meta<TestRtInputComponent>;

type Story = StoryObj<TestRtInputComponent>;

export const Default: Story = {
    args: {
        type: 'text',
        placeholder: 'Введите значение',
        iconLeft: null,
        iconRight: null,
        passwordToggle: false,
        autocomplete: null,
    },
};
