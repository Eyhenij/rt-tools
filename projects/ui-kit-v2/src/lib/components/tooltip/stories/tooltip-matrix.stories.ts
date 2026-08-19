import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlays } from '../../../../showcase/story-overlay';
import { TestRtTooltipMatrixComponent } from './component/test-tooltip-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Atoms/Tooltip',
    component: TestRtTooltipMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTooltipMatrixComponent>;

type TStory = StoryObj<TestRtTooltipMatrixComponent>;

/**
 * Подсказки показаны все сразу: их оверлей не слушает ни указателя снаружи, ни backdrop'а,
 * поэтому рядом стоящие панели друг друга не гасят. Открывает их наведение, а не щелчок —
 * щелчок подсказку как раз прячет. Ожидание в 400 мс покрывает задержку показа в 300 мс.
 */
const showAll: (context: { canvasElement: HTMLElement }) => Promise<void> = async ({
    canvasElement,
}: {
    canvasElement: HTMLElement;
}): Promise<void> => {
    await openStoryOverlays(canvasElement, { event: 'mouseenter', wait: 400 });
};

export const Placement: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'placement' },
    play: showAll,
};

export const Text: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'text' },
    play: showAll,
};

/**
 * На чём висит подсказка: на кнопке — директивой, на иконочной кнопке — её входом `tooltip`.
 * Третья ячейка намеренно пуста: пустой текст выключает директиву целиком, и панели не будет.
 */
export const Hosts: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'hosts' },
    play: showAll,
};

/**
 * Светло-тёмная пара показывает саму панель `rt-tooltip`, а не директиву: оверлей уезжает в
 * контейнер CDK — за пределы блока, которому пара назначает свойства темы. Подложка панели
 * инверсная, и в паре видно, что инверсия разворачивается вместе с темой.
 */
export const Themes: TStory = { args: { part: 'themes' } };
