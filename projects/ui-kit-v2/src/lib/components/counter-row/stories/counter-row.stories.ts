import { Meta, StoryObj } from '@storybook/angular';

import { TestRtCounterRowComponent } from './component/test-counter-row.component';

export default {
    title: 'Components/CounterRow',
    component: TestRtCounterRowComponent,
    argTypes: {
        label: { control: { type: 'text' } },
        hint: { control: { type: 'text' } },
    },
} as Meta<TestRtCounterRowComponent>;

type Story = StoryObj<TestRtCounterRowComponent>;

export const Default: Story = {
    args: {
        label: 'Сохранить',
        hint: 'Подсказка',
    },
};
