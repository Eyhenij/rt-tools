import { Meta, StoryObj } from '@storybook/angular';

import { TestRtToastMatrixComponent } from './component/test-toast-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Матрицы целятся в саму плашку, а не в стопку: тосты показываются шиной, и вид плашки надо
 * уметь показать без шины, таймеров и накопления.
 */
export default {
    title: 'Atoms/Feedback/Toast',
    component: TestRtToastMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtToastMatrixComponent>;

type TStory = StoryObj<TestRtToastMatrixComponent>;

export const Severity: TStory = { args: { part: 'severity' } };

export const Parts: TStory = { args: { part: 'parts' } };

export const Actions: TStory = { args: { part: 'actions' } };

export const Edges: TStory = { args: { part: 'edges' } };

export const Themes: TStory = { args: { part: 'themes' } };
