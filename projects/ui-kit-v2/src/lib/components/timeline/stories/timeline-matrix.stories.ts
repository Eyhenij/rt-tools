import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTimelineMatrixComponent } from './component/test-timeline-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Timeline',
    component: TestRtTimelineMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTimelineMatrixComponent>;

type Story = StoryObj<TestRtTimelineMatrixComponent>;

export const Status: Story = { args: { part: 'status' } };

export const Fields: Story = { args: { part: 'fields' } };

export const Length: Story = { args: { part: 'length' } };

export const Edges: Story = { args: { part: 'edges' } };

export const Themes: Story = { args: { part: 'themes' } };
