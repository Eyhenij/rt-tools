import { Meta, StoryObj } from '@storybook/angular';

import { TestRtStatTileMatrixComponent } from './component/test-stat-tile-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Data/StatTile',
    component: TestRtStatTileMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtStatTileMatrixComponent>;

type TStory = StoryObj<TestRtStatTileMatrixComponent>;

export const Delta: TStory = { args: { part: 'delta' } };

export const Baseline: TStory = { args: { part: 'baseline' } };

export const Parts: TStory = { args: { part: 'parts' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
