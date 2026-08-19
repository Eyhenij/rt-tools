import { Meta, StoryObj } from '@storybook/angular';

import { TestRtCollapsibleTextMatrixComponent } from './component/test-collapsible-text-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/CollapsibleText',
    component: TestRtCollapsibleTextMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtCollapsibleTextMatrixComponent>;

type TStory = StoryObj<TestRtCollapsibleTextMatrixComponent>;

export const Clamp: TStory = { args: { part: 'clamp' } };

export const Paragraphs: TStory = { args: { part: 'paragraphs' } };

export const Width: TStory = { args: { part: 'width' } };

export const Edges: TStory = { args: { part: 'edges' } };

export const Themes: TStory = { args: { part: 'themes' } };
