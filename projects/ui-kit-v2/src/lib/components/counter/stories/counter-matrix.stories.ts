import { Meta, StoryObj } from '@storybook/angular';

import { TestRtCounterMatrixComponent } from './component/test-counter-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Наведения и фокуса среди историй нет: своих состояний взаимодействия у счётчика не бывает,
 * они принадлежат его кнопкам и показаны в матрице `IconButton`.
 */
export default {
    title: 'Molecules/Forms/Counter',
    component: TestRtCounterMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtCounterMatrixComponent>;

type TStory = StoryObj<TestRtCounterMatrixComponent>;

export const Bounds: TStory = { args: { part: 'bounds' } };

export const Value: TStory = { args: { part: 'value' } };

export const States: TStory = { args: { part: 'states' } };

export const Themes: TStory = { args: { part: 'themes' } };
