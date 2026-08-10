import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtFileCardMatrixComponent } from './component/test-file-card-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/FileCard',
    component: TestRtFileCardMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtFileCardMatrixComponent>;

type Story = StoryObj<TestRtFileCardMatrixComponent>;

export const Size: Story = { args: { part: 'size' } };

export const Actions: Story = { args: { part: 'actions' } };

export const Name: Story = { args: { part: 'name' } };

export const Weight: Story = { args: { part: 'weight' } };

/** Наведение и фокус стилизованы у самой карточки — аддон псевдосостояний получает спуск до неё. */
export const States: Story = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-file-card') },
};

export const Disabled: Story = { args: { part: 'disabled' } };

export const Themes: Story = { args: { part: 'themes' } };
