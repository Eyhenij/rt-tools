import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtNightGridComponent } from './component/test-night-grid.component';

export default {
    title: 'Components/NightGrid',
    component: TestRtNightGridComponent,
    argTypes: {
        cells: { control: false },
        ariaLabel: { control: { type: 'text' } },
    },
} as Meta<TestRtNightGridComponent>;

type Story = StoryObj<TestRtNightGridComponent>;

export const Playground: Story = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        ariaLabel: 'Март',
    },
};
