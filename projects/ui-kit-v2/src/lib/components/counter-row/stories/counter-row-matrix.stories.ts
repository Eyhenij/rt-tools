import { Meta, StoryObj } from '@storybook/angular';

import { TestRtCounterRowMatrixComponent } from './component/test-counter-row-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Историй наведения и фокуса нет: строка отвечает только за раскладку, и состояния
 * принадлежат контролу, который в неё положили.
 */
export default {
    title: 'Molecules/Forms/CounterRow',
    component: TestRtCounterRowMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtCounterRowMatrixComponent>;

type TStory = StoryObj<TestRtCounterRowMatrixComponent>;

export const Anatomy: TStory = { args: { part: 'anatomy' } };

export const Content: TStory = { args: { part: 'content' } };

export const List: TStory = { args: { part: 'list' } };

export const Themes: TStory = { args: { part: 'themes' } };
