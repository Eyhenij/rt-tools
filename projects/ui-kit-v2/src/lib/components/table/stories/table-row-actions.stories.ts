import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
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
    parameters: storySnapshotSkip(
        'обёртка не передаёт действий, и полоса действий пуста; пустой показ покрытием не считается, наполнение — волна покрытия составных компонентов'
    ),
    args: {
        rtTableRowActionsRowType: [],
    },
};
