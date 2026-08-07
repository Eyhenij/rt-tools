import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtToggleButtonGroupMatrixComponent } from './component/test-toggle-button-group-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/ToggleButtonGroup',
    component: TestRtToggleButtonGroupMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtToggleButtonGroupMatrixComponent>;

type Story = StoryObj<TestRtToggleButtonGroupMatrixComponent>;

export const Size: Story = { args: { part: 'size' } };

export const Options: Story = { args: { part: 'options' } };

export const Value: Story = { args: { part: 'value' } };

export const FullWidth: Story = { args: { part: 'fullWidth' } };

/**
 * Состояния принадлежат сегменту, а не группе, — аддону передан спуск до кнопки. Признак стоит
 * на хосте, поэтому подсвечиваются сразу все сегменты ячейки: так видно, что делает наведение,
 * не заставляя искать, по какому из них навели.
 */
export const States: Story = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-toggle-button-group__button') },
};

export const Themes: Story = { args: { part: 'themes' } };
