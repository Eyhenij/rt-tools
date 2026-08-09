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

export const Default: Story = {
    parameters: storySnapshotSkip(
        'обёртка отдаёт пустой `cells`, и сетка не рисует ни одной ячейки; пустой показ покрытием не считается, наполнение — волна покрытия составных компонентов'
    ),
    args: {
        cells: [],
        ariaLabel: '',
    },
};
