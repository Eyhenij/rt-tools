import { Meta, StoryObj } from '@storybook/angular';

import { TestRtCollapsibleTextMatrixComponent } from './component/test-collapsible-text-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/CollapsibleText',
    component: TestRtCollapsibleTextMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtCollapsibleTextMatrixComponent>;

type Story = StoryObj<TestRtCollapsibleTextMatrixComponent>;

export const Clamp: Story = { args: { part: 'clamp' } };

export const Paragraphs: Story = { args: { part: 'paragraphs' } };

export const Width: Story = { args: { part: 'width' } };

export const Edges: Story = { args: { part: 'edges' } };

export const Themes: Story = { args: { part: 'themes' } };
