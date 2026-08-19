import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTabsMatrixComponent } from './component/test-tabs-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Navigation/Tabs',
    component: TestRtTabsMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTabsMatrixComponent>;

type TStory = StoryObj<TestRtTabsMatrixComponent>;

export const Direction: TStory = { args: { part: 'direction' } };

export const Title: TStory = { args: { part: 'title' } };

/** Все виды вкладки в одной полосе: порознь их не сравнить. */
export const TabState: TStory = { args: { part: 'tabState' }, parameters: { snapshot: { fullPage: true } } };

export const Stretch: TStory = { args: { part: 'stretch' } };

export const Edges: TStory = { args: { part: 'edges' } };

export const Themes: TStory = { args: { part: 'themes' } };
