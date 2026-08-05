import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDetailRowComponent } from './component/test-detail-row.component';

export default {
    title: 'Components/DetailRow',
    component: TestRtDetailRowComponent,
    argTypes: {
        label: { control: { type: 'text' } },
        loading: { control: { type: 'boolean' } },
    },
} as Meta<TestRtDetailRowComponent>;

type Story = StoryObj<TestRtDetailRowComponent>;

export const Default: Story = {
    args: {
        label: 'Сохранить',
        loading: false,
    },
};
