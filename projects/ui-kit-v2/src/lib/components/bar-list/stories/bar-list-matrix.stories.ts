import { Meta, StoryObj } from '@storybook/angular';

import { TestRtBarListMatrixComponent } from './component/test-bar-list-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/BarList',
    component: TestRtBarListMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtBarListMatrixComponent>;

type Story = StoryObj<TestRtBarListMatrixComponent>;

export const Share: Story = { args: { part: 'share' } };

export const Meta_: Story = { name: 'Meta', args: { part: 'meta' } };

export const Length: Story = { args: { part: 'length' } };

export const Empty: Story = { args: { part: 'empty' } };

export const Themes: Story = { args: { part: 'themes' } };
