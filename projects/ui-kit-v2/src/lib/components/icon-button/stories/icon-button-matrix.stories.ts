import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtIconButtonMatrixComponent } from './component/test-icon-button-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/IconButton',
    component: TestRtIconButtonMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtIconButtonMatrixComponent>;

type Story = StoryObj<TestRtIconButtonMatrixComponent>;

export const Variant: Story = { args: { part: 'variant' } };

export const Size: Story = { args: { part: 'size' } };

export const IconSize: Story = { args: { part: 'iconSize' } };

export const Shape: Story = { args: { part: 'shape' } };

export const Flags: Story = { args: { part: 'flags' } };

/**
 * Признак ставится на хост, а стилизована `<button>` внутри шаблона — поэтому аддону
 * псевдосостояний передан спуск до неё.
 */
export const States: Story = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('button') },
};

export const Themes: Story = { args: { part: 'themes' } };
