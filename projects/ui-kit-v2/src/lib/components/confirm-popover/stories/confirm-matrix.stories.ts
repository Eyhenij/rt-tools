import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { TestRtConfirmMatrixComponent } from './component/test-confirm-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Тон и наполнение показаны самой панелью, поставленной в разметку: она обычный компонент, и в
 * оверлее ей быть не обязательно. Под директивой три тона рядом не встали бы — щелчок по
 * второму триггеру закрыл бы первую панель.
 */
export default {
    title: 'Components/Confirm',
    component: TestRtConfirmMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtConfirmMatrixComponent>;

type Story = StoryObj<TestRtConfirmMatrixComponent>;

/** Тон подтверждающей кнопки — единственное, что окрашивает панель. */
export const Tone: Story = { args: { part: 'tone' } };

/** Заголовок и длина вопроса. */
export const Content: Story = { args: { part: 'content' } };

export const Themes: Story = { args: { part: 'themes' } };

/**
 * Панель под кнопкой — то, ради чего директива и нужна. Открывает её `play`-функция.
 * Кнопка сдвинута вправо: панель прижата к её правому краю, и у левого края окна этого не
 * увидеть.
 */
export const Panel: Story = {
    args: { part: 'panel' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement);
    },
};
