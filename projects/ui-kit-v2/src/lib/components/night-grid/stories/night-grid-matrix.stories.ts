import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtNightGridMatrixComponent } from './component/test-night-grid-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/NightGrid',
    component: TestRtNightGridMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtNightGridMatrixComponent>;

type TStory = StoryObj<TestRtNightGridMatrixComponent>;

export const State: TStory = { args: { part: 'state' } };

export const Length: TStory = { args: { part: 'length' } };

/** Наведение и фокус стилизованы у самой клетки — аддон псевдосостояний получает спуск до неё. */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('button') },
};

export const Edges: TStory = { args: { part: 'edges' } };

export const Themes: TStory = { args: { part: 'themes' } };
