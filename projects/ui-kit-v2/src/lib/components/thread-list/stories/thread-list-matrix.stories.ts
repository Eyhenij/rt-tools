import { Meta, StoryObj } from '@storybook/angular';

import { TestRtThreadListMatrixComponent } from './component/test-thread-list-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/ThreadList',
    component: TestRtThreadListMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtThreadListMatrixComponent>;

type Story = StoryObj<TestRtThreadListMatrixComponent>;

/** Все виды строки в одном списке: выбранная читается только рядом с невыбранными. */
export const RowState: Story = { args: { part: 'rowState' }, parameters: { snapshot: { fullPage: true } } };

export const Loading: Story = { args: { part: 'loading' } };

export const More: Story = { args: { part: 'more' } };

export const Empty: Story = { args: { part: 'empty' } };

export const Themes: Story = { args: { part: 'themes' } };
