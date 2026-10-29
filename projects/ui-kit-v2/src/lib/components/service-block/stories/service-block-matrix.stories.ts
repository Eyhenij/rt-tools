import { Meta, StoryObj } from '@storybook/angular';

import { TestRtServiceBlockMatrixComponent } from './component/test-service-block-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно.
 */
export default {
    title: 'Molecules/ServiceBlock',
    component: TestRtServiceBlockMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtServiceBlockMatrixComponent>;

type TStory = StoryObj<TestRtServiceBlockMatrixComponent>;

export const Content: TStory = { args: { part: 'content' } };

export const Width: TStory = { args: { part: 'width' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };

export const InForm: TStory = { args: { part: 'form' } };
