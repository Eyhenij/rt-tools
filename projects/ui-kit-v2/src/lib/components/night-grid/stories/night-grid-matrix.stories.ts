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

type Story = StoryObj<TestRtNightGridMatrixComponent>;

export const State: Story = { args: { part: 'state' } };

export const Length: Story = { args: { part: 'length' } };

/** Наведение и фокус стилизованы у самой клетки — аддон псевдосостояний получает спуск до неё. */
export const States: Story = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('button') },
};

export const Edges: Story = { args: { part: 'edges' } };

export const Themes: Story = { args: { part: 'themes' } };
