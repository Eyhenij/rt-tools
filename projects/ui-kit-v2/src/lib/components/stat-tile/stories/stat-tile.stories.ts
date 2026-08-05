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

export const Default: Story = {
    args: {
        label: 'Сохранить',
        value: 'Значение',
        secondary: null,
        deltaPrimary: null,
        deltaSecondary: null,
        hint: 'Подсказка',
    },
};
