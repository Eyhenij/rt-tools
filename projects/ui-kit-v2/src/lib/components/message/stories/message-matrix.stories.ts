import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMessageMatrixComponent } from './component/test-message-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Message',
    component: TestRtMessageMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtMessageMatrixComponent>;

type TStory = StoryObj<TestRtMessageMatrixComponent>;

export const Severity: TStory = { args: { part: 'severity' } };

export const Icon: TStory = { args: { part: 'icon' } };

export const Closable: TStory = { args: { part: 'closable' } };

export const Content: TStory = { args: { part: 'content' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
