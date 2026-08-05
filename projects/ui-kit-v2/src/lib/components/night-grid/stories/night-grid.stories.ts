import { Meta, StoryObj } from '@storybook/angular';

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
    args: {
        cells: [],
        ariaLabel: '',
    },
};
