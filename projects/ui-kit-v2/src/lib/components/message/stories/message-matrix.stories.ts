import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMessageMatrixComponent } from './component/test-message-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Message',
    component: TestRtMessageMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtMessageMatrixComponent>;

type Story = StoryObj<TestRtMessageMatrixComponent>;

export const Severity: Story = { args: { part: 'severity' } };

export const Icon: Story = { args: { part: 'icon' } };

export const Closable: Story = { args: { part: 'closable' } };

export const Content: Story = { args: { part: 'content' } };

export const Themes: Story = { args: { part: 'themes' } };
