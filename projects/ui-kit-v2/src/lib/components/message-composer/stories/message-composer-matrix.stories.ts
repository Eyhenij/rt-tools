import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMessageComposerMatrixComponent } from './component/test-message-composer-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/MessageComposer',
    component: TestRtMessageComposerMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtMessageComposerMatrixComponent>;

type TStory = StoryObj<TestRtMessageComposerMatrixComponent>;

export const State: TStory = { args: { part: 'state' } };

export const Attachments: TStory = { args: { part: 'attachments' } };

export const Formatting: TStory = { args: { part: 'formatting' } };

export const Rows: TStory = { args: { part: 'rows' } };

export const Themes: TStory = { args: { part: 'themes' } };
