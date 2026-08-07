import { Meta, StoryObj } from '@storybook/angular';

import { TestRtAsideHeaderMatrixComponent } from './component/test-aside-header-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/AsideHeader',
    component: TestRtAsideHeaderMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtAsideHeaderMatrixComponent>;

type Story = StoryObj<TestRtAsideHeaderMatrixComponent>;

/** Заголовок, надзаголовок и стрелка возврата. */
export const Heading: Story = { args: { part: 'heading' } };

/** Ряд бэйджей: без них, один, несколько, со ссылкой наружу. */
export const Badges: Story = { args: { part: 'badges' } };

/** Загрузка: заголовок подменяется заглушкой, остальное остаётся на месте. */
export const States: Story = { args: { part: 'states' } };

export const Themes: Story = { args: { part: 'themes' } };
