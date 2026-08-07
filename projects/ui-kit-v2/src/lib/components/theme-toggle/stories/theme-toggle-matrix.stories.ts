import { Meta, StoryObj } from '@storybook/angular';

import { TestRtThemeToggleMatrixComponent } from './component/test-theme-toggle-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/ThemeToggle',
    component: TestRtThemeToggleMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtThemeToggleMatrixComponent>;

type Story = StoryObj<TestRtThemeToggleMatrixComponent>;

export const Appearance: Story = { args: { part: 'appearance' } };
