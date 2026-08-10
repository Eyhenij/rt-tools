import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtTabsComponent } from './component/test-tabs.component';

export default {
    title: 'Components/Tabs',
    component: TestRtTabsComponent,
    argTypes: {
        activeId: { control: false },
        direction: {
            options: ['horizontal', 'vertical'],
            control: { type: 'select' },
        },
        stretch: { control: { type: 'boolean' } },
        contentScrollable: { control: { type: 'boolean' } },
    },
} as Meta<TestRtTabsComponent>;

type Story = StoryObj<TestRtTabsComponent>;

export const Playground: Story = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        activeId: null,
        direction: 'horizontal',
        stretch: false,
        contentScrollable: true,
    },
};
