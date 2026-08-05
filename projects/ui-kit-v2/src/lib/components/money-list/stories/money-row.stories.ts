import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMoneyRowComponent } from './component/test-money-row.component';

export default {
    title: 'Components/MoneyRow',
    component: TestRtMoneyRowComponent,
    argTypes: {
        label: { control: { type: 'text' } },
        total: { control: { type: 'boolean' } },
        loading: { control: { type: 'boolean' } },
    },
} as Meta<TestRtMoneyRowComponent>;

type Story = StoryObj<TestRtMoneyRowComponent>;

export const Default: Story = {
    args: {
        label: 'Сохранить',
        total: false,
        loading: false,
    },
};
