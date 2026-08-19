import { Meta, StoryObj } from '@storybook/angular';

import { TestRtStepperMatrixComponent } from './component/test-stepper-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Atoms/Feedback/Stepper',
    component: TestRtStepperMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtStepperMatrixComponent>;

type TStory = StoryObj<TestRtStepperMatrixComponent>;

export const Position: TStory = { args: { part: 'position' } };

export const Length: TStory = { args: { part: 'length' } };

export const Description: TStory = { args: { part: 'description' } };

export const Edges: TStory = { args: { part: 'edges' } };

export const Themes: TStory = { args: { part: 'themes' } };
