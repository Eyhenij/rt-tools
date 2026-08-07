import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDeltaViewMatrixComponent } from './component/test-delta-view-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/DeltaView',
    component: TestRtDeltaViewMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDeltaViewMatrixComponent>;

type Story = StoryObj<TestRtDeltaViewMatrixComponent>;

export const Formats: Story = { args: { part: 'formats' } };

export const Blocks: Story = { args: { part: 'blocks' } };

export const Empty: Story = { args: { part: 'empty' } };

export const Themes: Story = { args: { part: 'themes' } };
