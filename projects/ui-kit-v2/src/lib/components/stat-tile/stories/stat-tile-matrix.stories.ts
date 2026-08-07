import { Meta, StoryObj } from '@storybook/angular';

import { TestRtStatTileMatrixComponent } from './component/test-stat-tile-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/StatTile',
    component: TestRtStatTileMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtStatTileMatrixComponent>;

type Story = StoryObj<TestRtStatTileMatrixComponent>;

export const Delta: Story = { args: { part: 'delta' } };

export const Baseline: Story = { args: { part: 'baseline' } };

export const Parts: Story = { args: { part: 'parts' } };

export const Themes: Story = { args: { part: 'themes' } };
