import { Meta, StoryObj } from '@storybook/angular';

import { TestRtBadgeMatrixComponent } from './component/test-badge-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу. Контролов здесь
 * нет намеренно: значение, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 */
export default {
    title: 'Atoms/Badge',
    component: TestRtBadgeMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtBadgeMatrixComponent>;

type TStory = StoryObj<TestRtBadgeMatrixComponent>;

export const Position: TStory = { args: { part: 'position' } };

export const Color: TStory = { args: { part: 'color' } };

export const Value: TStory = { args: { part: 'value' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
