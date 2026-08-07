import { Meta, StoryObj } from '@storybook/angular';

import { TestRtStatTileComponent } from './component/test-stat-tile.component';

export default {
    title: 'Components/StatTile',
    component: TestRtStatTileComponent,
    argTypes: {
        label: { control: { type: 'text' } },
        value: { control: { type: 'text' } },
        secondary: { control: { type: 'text' } },
        deltaPrimary: { control: false },
        deltaSecondary: { control: false },
        hint: { control: { type: 'text' } },
    },
} as Meta<TestRtStatTileComponent>;

type Story = StoryObj<TestRtStatTileComponent>;

export const Playground: Story = {
    args: {
        label: 'Визиты',
        value: '1 240',
        secondary: 'из них 300 новых',
        deltaPrimary: { percent: 12.5, label: 'к прошлой неделе', baseline: '1 100' },
        deltaSecondary: { percent: 8, label: 'к прошлому году' },
        hint: 'Считается по уникальным',
    },
};
