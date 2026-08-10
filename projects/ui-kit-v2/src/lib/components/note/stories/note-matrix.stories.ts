import { Meta, StoryObj } from '@storybook/angular';

import { TestRtNoteMatrixComponent } from './component/test-note-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Note',
    component: TestRtNoteMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtNoteMatrixComponent>;

type Story = StoryObj<TestRtNoteMatrixComponent>;

export const Content: Story = { args: { part: 'content' } };

export const Width: Story = { args: { part: 'width' } };

/** Пустая заметка стоит рядом с полной: подложка остаётся, и пропуск виден только парой. */
export const Edges: Story = { args: { part: 'edges' } };

export const Themes: Story = { args: { part: 'themes' } };
