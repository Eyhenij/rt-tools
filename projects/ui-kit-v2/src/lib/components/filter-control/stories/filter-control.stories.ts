import { Meta, StoryObj } from '@storybook/angular';

import { TestRtFilterControlComponent } from './component/test-filter-control.component';

export default {
    title: 'Components/FilterControl',
    component: TestRtFilterControlComponent,
    argTypes: {
        options: { control: false },
        value: { control: { type: 'text' } },
        ariaLabel: { control: { type: 'text' } },
        placeholder: { control: { type: 'text' } },
        size: {
            options: ['sm', 'md', 'lg'],
            control: { type: 'select' },
        },
        disabled: { control: { type: 'boolean' } },
        fullWidth: { control: { type: 'boolean' } },
    },
} as Meta<TestRtFilterControlComponent>;

type Story = StoryObj<TestRtFilterControlComponent>;

export const Playground: Story = {
    args: {
        options: [],
        value: undefined,
        ariaLabel: null,
        placeholder: 'Введите значение',
        size: 'sm',
        disabled: false,
        fullWidth: false,
    },
};
