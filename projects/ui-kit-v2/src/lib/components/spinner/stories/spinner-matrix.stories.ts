import { Meta, StoryObj } from '@storybook/angular';

import { TestRtSpinnerMatrixComponent } from './component/test-spinner-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Spinner',
    component: TestRtSpinnerMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtSpinnerMatrixComponent>;

type TStory = StoryObj<TestRtSpinnerMatrixComponent>;

export const Color: TStory = { args: { part: 'color' } };

export const Diameter: TStory = { args: { part: 'diameter' } };

export const Themes: TStory = { args: { part: 'themes' } };
