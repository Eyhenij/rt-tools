import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtCardMatrixComponent } from './component/test-card-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Card',
    component: TestRtCardMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtCardMatrixComponent>;

type Story = StoryObj<TestRtCardMatrixComponent>;

export const Header: Story = { args: { part: 'header' } };

export const Slots: Story = { args: { part: 'slots' } };

export const Clickable: Story = { args: { part: 'clickable' } };

/**
 * Наведение и фокус стилизованы у самой карточки — статья с модификатором нажимаемости, — и
 * аддон псевдосостояний получает спуск до неё: признак стоит на хосте компонента.
 */
export const States: Story = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-card') },
};

export const Themes: Story = { args: { part: 'themes' } };
