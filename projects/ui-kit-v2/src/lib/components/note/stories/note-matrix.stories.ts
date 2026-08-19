import { Meta, StoryObj } from '@storybook/angular';

import { TestRtNoteMatrixComponent } from './component/test-note-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Atoms/Feedback/Note',
    component: TestRtNoteMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtNoteMatrixComponent>;

type TStory = StoryObj<TestRtNoteMatrixComponent>;

export const Content: TStory = { args: { part: 'content' } };

export const Width: TStory = { args: { part: 'width' } };

/** Пустая заметка стоит рядом с полной: подложка остаётся, и пропуск виден только парой. */
export const Edges: TStory = { args: { part: 'edges' } };

export const Themes: TStory = { args: { part: 'themes' } };
