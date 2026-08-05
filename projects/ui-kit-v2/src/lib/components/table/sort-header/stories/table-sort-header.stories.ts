import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTableSortHeaderComponent } from './component/test-table-sort-header.component';

export default {
    title: 'Components/TableSortHeader',
    component: TestRtTableSortHeaderComponent,
    argTypes: {
        rtSortHeader: { control: { type: 'text' } },
    },
} as Meta<TestRtTableSortHeaderComponent>;

type Story = StoryObj<TestRtTableSortHeaderComponent>;

export const Default: Story = {
    args: {
        rtSortHeader: '',
    },
};
