import { Meta, StoryObj } from '@storybook/angular';

import { TestRtHeaderMatrixComponent } from './component/test-header-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Organisms/Layout/Header',
    component: TestRtHeaderMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtHeaderMatrixComponent>;

type TStory = StoryObj<TestRtHeaderMatrixComponent>;

export const Back: TStory = { args: { part: 'back' } };

export const Invite: TStory = { args: { part: 'invite' } };

export const Bell: TStory = { args: { part: 'bell' } };

export const Themes: TStory = { args: { part: 'themes' } };
