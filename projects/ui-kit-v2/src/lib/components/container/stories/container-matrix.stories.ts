import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtMost } from '../../../../showcase';
import { TestRtContainerMatrixComponent } from './component/test-container-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Каркас показан уменьшенным: настоящий занимает окно целиком, и рядом два таких не поставить.
 */
export default {
    title: 'Organisms/Layout/Container',
    component: TestRtContainerMatrixComponent,
    parameters: {
        controls: { disable: true },
        // Каркас называет ширину сам: `@media (width <= 768px)` в его стилях перекладывает зоны.
        // Кадр порога снимается на той стороне, которую правило включает, — в окне ровно 768.
        snapshot: { widths: [storyWidthAtMost(768)] },
    },
} as Meta<TestRtContainerMatrixComponent>;

type TStory = StoryObj<TestRtContainerMatrixComponent>;

/** Необъявленная зона не создаёт пустого узла — каркас состоит ровно из того, что передали. */
export const Zones: TStory = { args: { part: 'zones' } };

export const Themes: TStory = { args: { part: 'themes' } };
