import { Meta, StoryObj } from '@storybook/angular';

import { TestRtProfileMenuMatrixComponent } from './component/test-profile-menu-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все сочетания частей сразу.
 * Контролов здесь нет намеренно.
 */
export default {
    title: 'Molecules/Navigation/ProfileMenu',
    component: TestRtProfileMenuMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtProfileMenuMatrixComponent>;

type TStory = StoryObj<TestRtProfileMenuMatrixComponent>;

/** Полное меню, недоступная смена организации и меню без организации с выходом в процессе. */
export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
