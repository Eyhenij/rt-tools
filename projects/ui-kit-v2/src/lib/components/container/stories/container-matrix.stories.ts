import { Meta, StoryObj } from '@storybook/angular';

import { TestRtContainerMatrixComponent } from './component/test-container-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Каркас показан уменьшенным: настоящий занимает окно целиком, и рядом два таких не поставить.
 */
export default {
    title: 'Components/Container',
    component: TestRtContainerMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtContainerMatrixComponent>;

type Story = StoryObj<TestRtContainerMatrixComponent>;

/** Необъявленная зона не создаёт пустого узла — каркас состоит ровно из того, что передали. */
export const Zones: Story = { args: { part: 'zones' } };

export const Themes: Story = { args: { part: 'themes' } };
