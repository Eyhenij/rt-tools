import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDeltaViewMatrixComponent } from './component/test-delta-view-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Data/DeltaView',
    component: TestRtDeltaViewMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDeltaViewMatrixComponent>;

type TStory = StoryObj<TestRtDeltaViewMatrixComponent>;

export const Formats: TStory = { args: { part: 'formats' } };

export const Blocks: TStory = { args: { part: 'blocks' } };

export const Empty: TStory = { args: { part: 'empty' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
