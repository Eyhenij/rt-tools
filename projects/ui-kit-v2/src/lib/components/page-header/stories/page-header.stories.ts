import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtPageHeaderComponent } from './component/test-page-header.component';

export default {
    title: 'Components/PageHeader',
    component: TestRtPageHeaderComponent,
    argTypes: {
        items: { control: false },
        user: { control: false },
        userTitle: { control: { type: 'text' } },
        userMenu: { control: false },
        ariaLabel: { control: { type: 'text' } },
    },
} as Meta<TestRtPageHeaderComponent>;

type Story = StoryObj<TestRtPageHeaderComponent>;

export const Playground: Story = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        userTitle: '',
        userMenu: null,
        ariaLabel: '',
    },
};
