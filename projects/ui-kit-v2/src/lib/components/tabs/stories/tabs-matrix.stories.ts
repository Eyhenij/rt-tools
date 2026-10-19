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

/** Переполненная полоса: стрелки поверх вкладок и стрелки в своих местах, неактивная — бледная. */
export const ScrollArrows: TStory = { args: { part: 'scrollArrows' } };

/** Закрываемые вкладки: крестик и Delete просят хозяина убрать вкладку; у отключённой крестика нет. */
export const Closable: TStory = { args: { part: 'closable' } };

/** Вкладки из значка Material: имя для чтения с экрана и подсказка — из `tooltip`, в том числе у отключённой. */
export const IconOnly: TStory = { args: { part: 'iconOnly' } };

/** Только полоса: вкладки служат навигацией в середине `rt-toolbar`, панели содержимого нет. */
export const HeaderOnly: TStory = { args: { part: 'headerOnly' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
