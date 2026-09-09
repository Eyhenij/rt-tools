import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMarkdownTextMatrixComponent } from './component/test-markdown-text-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/MarkdownText',
    component: TestRtMarkdownTextMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtMarkdownTextMatrixComponent>;

type TStory = StoryObj<TestRtMarkdownTextMatrixComponent>;

export const Blocks: TStory = { args: { part: 'blocks' } };

export const Inline: TStory = { args: { part: 'inline' } };

export const Outside: TStory = { args: { part: 'outside' } };

export const Edges: TStory = { args: { part: 'edges' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
