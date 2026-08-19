import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtThemeToggleComponent } from './component/test-theme-toggle.component';

export default {
    title: 'Molecules/ThemeToggle',
    component: TestRtThemeToggleComponent,
    argTypes: {
        appearance: {
            options: ['icon', 'switch'],
            control: { type: 'select' },
        },
    },
} as Meta<TestRtThemeToggleComponent>;

type TStory = StoryObj<TestRtThemeToggleComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        appearance: 'icon',
    },
};
