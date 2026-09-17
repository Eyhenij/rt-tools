import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTagMatrixComponent } from './component/test-tag-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Atoms/Tag',
    component: TestRtTagMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTagMatrixComponent>;

type TStory = StoryObj<TestRtTagMatrixComponent>;

export const Severity: TStory = { args: { part: 'severity' } };

export const Size: TStory = { args: { part: 'size' } };

export const Overflow: TStory = { args: { part: 'overflow' } };

export const Shape: TStory = { args: { part: 'shape' } };

export const Radius: TStory = { args: { part: 'radius' } };

export const Icon: TStory = { args: { part: 'icon' } };

export const Closable: TStory = { args: { part: 'closable' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
