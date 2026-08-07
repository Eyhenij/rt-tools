import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTagMatrixComponent } from './component/test-tag-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Tag',
    component: TestRtTagMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTagMatrixComponent>;

type Story = StoryObj<TestRtTagMatrixComponent>;

export const Severity: Story = { args: { part: 'severity' } };

export const Shape: Story = { args: { part: 'shape' } };

export const Radius: Story = { args: { part: 'radius' } };

export const Icon: Story = { args: { part: 'icon' } };

export const Closable: Story = { args: { part: 'closable' } };

export const Themes: Story = { args: { part: 'themes' } };
