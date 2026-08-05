import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTableComponent } from './component/test-table.component';

export default {
    title: 'Components/Table',
    component: TestRtTableComponent,
    argTypes: {
        ariaLabel: { control: { type: 'text' } },
        density: {
            options: ['default', 'compact'],
            control: { type: 'select' },
        },
        cards: { control: { type: 'boolean' } },
        clickable: { control: { type: 'boolean' } },
        loading: { control: { type: 'boolean' } },
        fetching: { control: { type: 'boolean' } },
        columns: { control: false },
        columnsConfig: { control: false },
        tableId: { control: { type: 'text' } },
        showRowActions: { control: { type: 'boolean' } },
        rowHasActions: { control: false },
        sort: { control: false },
        skeletonRows: { control: { type: 'number' } },
        emptyMessage: { control: { type: 'text' } },
        emptyIcon: { control: false },
        emptyDescription: { control: { type: 'text' } },
    },
} as Meta<TestRtTableComponent>;

type Story = StoryObj<TestRtTableComponent>;

export const Default: Story = {
    args: {
        ariaLabel: null,
        density: 'default',
        cards: true,
        clickable: false,
        loading: false,
        fetching: false,
        columns: [],
        columnsConfig: [],
        tableId: null,
        showRowActions: false,
        rowHasActions: null,
        sort: null,
        skeletonRows: 5,
        emptyMessage: '',
        emptyIcon: 'inbox',
        emptyDescription: null,
    },
};
