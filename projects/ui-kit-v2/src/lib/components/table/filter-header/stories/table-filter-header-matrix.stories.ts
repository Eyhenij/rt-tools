import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTableFilterHeaderMatrixComponent } from './component/test-table-filter-header-matrix.component';

export default {
    title: 'Organisms/Table/TableFilterHeader',
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
