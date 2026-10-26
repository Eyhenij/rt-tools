import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDividerMatrixComponent } from './component/test-divider-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу. Контролов здесь
 * нет намеренно: значение, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 */
export default {
    title: 'Atoms/Divider',
    component: TestRtDividerMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDividerMatrixComponent>;

type TStory = StoryObj<TestRtDividerMatrixComponent>;

export const Orientation: TStory = { args: { part: 'orientation' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
