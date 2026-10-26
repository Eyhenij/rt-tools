import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDrawerMatrixComponent } from './component/test-drawer-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу. Контролов здесь
 * нет намеренно: значение, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 */
export default {
    title: 'Organisms/Layout/Drawer',
    component: TestRtDrawerMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDrawerMatrixComponent>;

type TStory = StoryObj<TestRtDrawerMatrixComponent>;

export const Mode: TStory = { args: { part: 'mode' } };

export const States: TStory = { args: { part: 'states' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
