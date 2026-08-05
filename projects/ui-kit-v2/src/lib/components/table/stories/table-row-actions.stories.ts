import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTableRowActionsComponent } from './component/test-table-row-actions.component';

export default {
    title: 'Components/TableRowActions',
    component: TestRtTableRowActionsComponent,
    argTypes: {
        rtTableRowActionsRowType: { control: false },
    },
} as Meta<TestRtTableRowActionsComponent>;

type Story = StoryObj<TestRtTableRowActionsComponent>;

export const Default: Story = {
    args: {
        rtTableRowActionsRowType: [],
    },
};
