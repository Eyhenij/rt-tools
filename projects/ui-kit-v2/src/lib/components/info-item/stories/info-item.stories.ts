import { Meta, StoryObj } from '@storybook/angular';

import { TestRtInfoItemComponent } from './component/test-info-item.component';

export default {
    title: 'Components/InfoItem',
    component: TestRtInfoItemComponent,
    argTypes: {
        label: { control: { type: 'text' } },
        value: { control: { type: 'text' } },
        loading: { control: { type: 'boolean' } },
        grow: { control: { type: 'boolean' } },
    },
} as Meta<TestRtInfoItemComponent>;

type Story = StoryObj<TestRtInfoItemComponent>;

export const Playground: Story = {
    args: {
        label: 'Тариф',
        value: 'Годовой',
        loading: false,
        grow: false,
    },
};
