import { Meta, StoryObj } from '@storybook/angular';

import { TestRtAiRunStatusMatrixComponent } from './component/test-ai-run-status-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно.
 */
export default {
    title: 'Molecules/Chat/AiRunStatus',
    component: TestRtAiRunStatusMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtAiRunStatusMatrixComponent>;

type TStory = StoryObj<TestRtAiRunStatusMatrixComponent>;

export const State: TStory = { args: { part: 'state' } };

export const Steps: TStory = { args: { part: 'steps' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
