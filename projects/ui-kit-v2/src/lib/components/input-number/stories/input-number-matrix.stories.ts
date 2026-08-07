import { Meta, StoryObj } from '@storybook/angular';

import { STORY_PSEUDO_PARAMETERS } from '../../../../showcase/story-states';
import { TestRtInputNumberMatrixComponent } from './component/test-input-number-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/InputNumber',
    component: TestRtInputNumberMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtInputNumberMatrixComponent>;

type Story = StoryObj<TestRtInputNumberMatrixComponent>;

export const Size: Story = { args: { part: 'size' } };

export const Prefix: Story = { args: { part: 'prefix' } };

export const Fraction: Story = { args: { part: 'fraction' } };

export const Filling: Story = { args: { part: 'filling' } };

export const Bordered: Story = { args: { part: 'bordered' } };

/** Наведение и фокус внутри проставляет аддон псевдосостояний по признаку `data-story-state`. */
export const States: Story = {
    args: { part: 'states' },
    parameters: { pseudo: STORY_PSEUDO_PARAMETERS },
};

export const Themes: Story = { args: { part: 'themes' } };
