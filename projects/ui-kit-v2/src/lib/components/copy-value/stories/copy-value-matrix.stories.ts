import { Meta, StoryObj } from '@storybook/angular';

import { TestRtCopyValueMatrixComponent } from './component/test-copy-value-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно.
 */
export default {
    title: 'Molecules/CopyValue',
    component: TestRtCopyValueMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtCopyValueMatrixComponent>;

type TStory = StoryObj<TestRtCopyValueMatrixComponent>;

export const Label: TStory = { args: { part: 'label' } };

export const Width: TStory = { args: { part: 'width' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
