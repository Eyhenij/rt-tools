import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTableFilterHeaderMatrixComponent } from './component/test-table-filter-header-matrix.component';

export default {
    title: 'Organisms/Tables & Lists/TableFilterHeader',
    component: TestRtTableFilterHeaderMatrixComponent,
} as Meta<TestRtTableFilterHeaderMatrixComponent>;

type TStory = StoryObj<TestRtTableFilterHeaderMatrixComponent>;

/** Четыре вида отбора: вид решает, какую готовую часть кита зовёт шапка. */
export const Kinds: TStory = { args: { part: 'kinds' } };

/** Состояния ячейки: отбор не задан, отбор задан, свой набор видов сравнения, колонки без отбора. */
export const States: TStory = { args: { part: 'states' } };

/** Оба набора оформления на одном показе. */
export const Presets: TStory = { args: { part: 'presets' } };

/** Светлая и тёмная тема рядом. */
export const Themes: TStory = { args: { part: 'themes' } };

/**
 * Отбор там, где он живёт: в шапке настоящей таблицы кита. Показан заданный отбор по городу —
 * строк в таблице меньше, чем в наборе. Сужает строки потребитель: ячейка только сообщает набор
 * условий наружу.
 */
export const InTable: TStory = { args: { part: 'in-table' } };
