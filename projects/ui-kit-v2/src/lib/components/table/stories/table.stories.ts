import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
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
        rows: { control: false },
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

export const Playground: Story = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        ariaLabel: 'Договоры',
        density: 'default',
        cards: true,
        clickable: false,
        loading: false,
        fetching: false,
        tableId: null,
        showRowActions: true,
        rowHasActions: null,
        sort: null,
        skeletonRows: 5,
        emptyMessage: '',
        emptyIcon: 'inbox',
        emptyDescription: null,
    },
};
