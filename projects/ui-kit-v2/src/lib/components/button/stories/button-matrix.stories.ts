import { Meta, StoryObj } from '@storybook/angular';

import { STORY_PSEUDO_PARAMETERS } from '../../../../showcase/story-states';
import { TestRtButtonMatrixComponent } from './component/test-button-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Button',
    component: TestRtButtonMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtButtonMatrixComponent>;

type Story = StoryObj<TestRtButtonMatrixComponent>;

export const Appearance: Story = { args: { part: 'appearance' } };

export const Size: Story = { args: { part: 'size' } };

export const Icon: Story = { args: { part: 'icon' } };

export const Rounded: Story = { args: { part: 'rounded' } };

export const Loading: Story = { args: { part: 'loading' } };

export const Disabled: Story = { args: { part: 'disabled' } };

/** Наведение, нажатие и фокус проставляет аддон псевдосостояний по признаку `data-story-state`. */
export const States: Story = {
    args: { part: 'states' },
    parameters: { pseudo: STORY_PSEUDO_PARAMETERS },
};

export const Themes: Story = { args: { part: 'themes' } };
