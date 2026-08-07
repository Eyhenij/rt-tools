import { Meta, StoryObj } from '@storybook/angular';

import { TestRtInputNumberComponent } from './component/test-input-number.component';

export default {
    title: 'Components/InputNumber',
    component: TestRtInputNumberComponent,
    argTypes: {
        iconLeft: { control: false },
        prefix: { control: { type: 'text' } },
        placeholder: { control: { type: 'text' } },
        min: { control: { type: 'number' } },
        max: { control: { type: 'number' } },
        minFractionDigits: { control: { type: 'number' } },
        maxFractionDigits: { control: { type: 'number' } },
    },
} as Meta<TestRtInputNumberComponent>;

type Story = StoryObj<TestRtInputNumberComponent>;

export const Playground: Story = {
    args: {
        iconLeft: null,
        prefix: null,
        placeholder: 'Введите значение',
        min: null,
        max: null,
        minFractionDigits: 0,
        maxFractionDigits: 2,
    },
};
