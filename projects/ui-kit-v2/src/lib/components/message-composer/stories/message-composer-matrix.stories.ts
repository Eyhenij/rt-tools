import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMessageComposerMatrixComponent } from './component/test-message-composer-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/MessageComposer',
    component: TestRtMessageComposerMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtMessageComposerMatrixComponent>;

type Story = StoryObj<TestRtMessageComposerMatrixComponent>;

export const State: Story = { args: { part: 'state' } };

export const Attachments: Story = { args: { part: 'attachments' } };

export const Formatting: Story = { args: { part: 'formatting' } };

export const Rows: Story = { args: { part: 'rows' } };

export const Themes: Story = { args: { part: 'themes' } };
