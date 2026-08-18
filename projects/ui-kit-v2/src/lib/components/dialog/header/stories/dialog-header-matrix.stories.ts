import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDialogHeaderMatrixComponent } from './component/test-dialog-header-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/DialogHeader',
    component: TestRtDialogHeaderMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDialogHeaderMatrixComponent>;

type TStory = StoryObj<TestRtDialogHeaderMatrixComponent>;

export const Closable: TStory = { args: { part: 'closable' } };

export const Title: TStory = { args: { part: 'title' } };

export const Themes: TStory = { args: { part: 'themes' } };
