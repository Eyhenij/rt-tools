import { Meta, StoryObj } from '@storybook/angular';

import { TestRtServiceLogoMatrixComponent } from './component/test-service-logo-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно.
 */
export default {
    title: 'Molecules/ServiceLogo',
    component: TestRtServiceLogoMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtServiceLogoMatrixComponent>;

type TStory = StoryObj<TestRtServiceLogoMatrixComponent>;

export const Size: TStory = { args: { part: 'size' } };

export const Icon: TStory = { args: { part: 'icon' } };

export const Themes: TStory = { args: { part: 'themes' } };
