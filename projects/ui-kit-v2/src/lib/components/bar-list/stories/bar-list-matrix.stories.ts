import { Meta, StoryObj } from '@storybook/angular';

import { TestRtBarListMatrixComponent } from './component/test-bar-list-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Data/BarList',
    component: TestRtBarListMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtBarListMatrixComponent>;

type TStory = StoryObj<TestRtBarListMatrixComponent>;

export const Share: TStory = { args: { part: 'share' } };

export const MetaPart: TStory = { name: 'Meta', args: { part: 'meta' } };

export const Length: TStory = { args: { part: 'length' } };

export const Empty: TStory = { args: { part: 'empty' } };

export const Themes: TStory = { args: { part: 'themes' } };
