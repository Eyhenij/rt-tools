import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTabsMatrixComponent } from './component/test-tabs-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Tabs',
    component: TestRtTabsMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTabsMatrixComponent>;

type Story = StoryObj<TestRtTabsMatrixComponent>;

export const Direction: Story = { args: { part: 'direction' } };

export const Title: Story = { args: { part: 'title' } };

/** Все виды вкладки в одной полосе: порознь их не сравнить. */
export const TabState: Story = { args: { part: 'tabState' }, parameters: { snapshot: { fullPage: true } } };

export const Stretch: Story = { args: { part: 'stretch' } };

export const Edges: Story = { args: { part: 'edges' } };

export const Themes: Story = { args: { part: 'themes' } };
