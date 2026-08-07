import { Meta, StoryObj } from '@storybook/angular';

import { startStoryFileDrag } from '../../../../showcase/story-drag';
import { TestRtFileDropMatrixComponent } from './component/test-file-drop-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Подсветку рисует не вход, а признак, который компонент поднимает сам, поймав перетаскивание.
 * Поэтому истории с подсветкой открывает `play`-функция: она посылает событие перетаскивания с
 * настоящим файлом внутри.
 */
export default {
    title: 'Components/FileDrop',
    component: TestRtFileDropMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtFileDropMatrixComponent>;

type Story = StoryObj<TestRtFileDropMatrixComponent>;

/** Пока файл не тащат, видно только содержимое: отключённость на нём не видна намеренно. */
export const Resting: Story = { args: { part: 'resting' } };

/** Подсказка поверх содержимого: подпись кита, своя подпись и отключённая область без подсказки. */
export const Dragging: Story = {
    args: { part: 'dragging' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await startStoryFileDrag(canvasElement);
    },
};

/**
 * Зоны — стопка равных полос; подсвечена та, над которой курсор. Курсор здесь висит на трети
 * высоты: в двух зонах это первая, в трёх — тоже первая, и рядом видно, что доля высоты решает.
 */
export const Zones: Story = {
    args: { part: 'zones' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await startStoryFileDrag(canvasElement, 0.3);
    },
};

export const Themes: Story = {
    args: { part: 'themes' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await startStoryFileDrag(canvasElement);
    },
};
