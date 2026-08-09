import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTableCardComponent } from './component/test-table-card.component';

export default {
    title: 'Components/TableCard',
    component: TestRtTableCardComponent,
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        rtTableCardRowType: { control: false },
    },
} as Meta<TestRtTableCardComponent>;

type Story = StoryObj<TestRtTableCardComponent>;

export const Default: Story = {
    args: {
        rtTableCardRowType: [],
    },
};
