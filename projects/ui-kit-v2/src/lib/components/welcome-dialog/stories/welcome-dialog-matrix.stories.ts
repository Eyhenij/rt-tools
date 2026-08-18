import { Meta, StoryObj } from '@storybook/angular';

import { TestRtWelcomeDialogMatrixComponent } from './component/test-welcome-dialog-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/WelcomeDialog',
    component: TestRtWelcomeDialogMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtWelcomeDialogMatrixComponent>;

type TStory = StoryObj<TestRtWelcomeDialogMatrixComponent>;

export const Text: TStory = { args: { part: 'text' } };

export const Cta: TStory = { args: { part: 'cta' } };

/** Пустой текст стоит рядом с одним абзацем: без пары пустое окно выглядит исправным. */
export const Edges: TStory = { args: { part: 'edges' } };

export const Themes: TStory = { args: { part: 'themes' } };
