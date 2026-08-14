import { Meta, StoryObj } from '@storybook/angular';

import { TestRtHeaderMatrixComponent } from './component/test-header-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Header',
    component: TestRtHeaderMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtHeaderMatrixComponent>;

type Story = StoryObj<TestRtHeaderMatrixComponent>;

export const Back: Story = { args: { part: 'back' } };

export const Invite: Story = { args: { part: 'invite' } };

export const Bell: Story = { args: { part: 'bell' } };

export const Themes: Story = { args: { part: 'themes' } };
