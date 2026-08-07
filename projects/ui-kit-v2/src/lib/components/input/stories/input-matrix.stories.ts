import { Meta, StoryObj } from '@storybook/angular';

import { STORY_PSEUDO_PARAMETERS } from '../../../../showcase/story-states';
import { TestRtInputMatrixComponent } from './component/test-input-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Input',
    component: TestRtInputMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtInputMatrixComponent>;

type Story = StoryObj<TestRtInputMatrixComponent>;

export const Size: Story = { args: { part: 'size' } };

export const Type: Story = { args: { part: 'type' } };

export const Icons: Story = { args: { part: 'icons' } };

export const Filling: Story = { args: { part: 'filling' } };

export const Bordered: Story = { args: { part: 'bordered' } };

/** Наведение и фокус внутри проставляет аддон псевдосостояний по признаку `data-story-state`. */
export const States: Story = {
    args: { part: 'states' },
    parameters: { pseudo: STORY_PSEUDO_PARAMETERS },
};

export const Themes: Story = { args: { part: 'themes' } };
