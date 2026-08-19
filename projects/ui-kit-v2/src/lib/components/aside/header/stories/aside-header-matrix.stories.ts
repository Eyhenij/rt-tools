import { Meta, StoryObj } from '@storybook/angular';

import { TestRtAsideHeaderMatrixComponent } from './component/test-aside-header-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Organisms/Aside/AsideHeader',
    component: TestRtAsideHeaderMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtAsideHeaderMatrixComponent>;

type TStory = StoryObj<TestRtAsideHeaderMatrixComponent>;

/** Заголовок, надзаголовок и стрелка возврата. */
export const Heading: TStory = { args: { part: 'heading' } };

/** Ряд бэйджей: без них, один, несколько, со ссылкой наружу. */
export const Badges: TStory = { args: { part: 'badges' } };

/** Загрузка: заголовок подменяется заглушкой, остальное остаётся на месте. */
export const States: TStory = { args: { part: 'states' } };

export const Themes: TStory = { args: { part: 'themes' } };
