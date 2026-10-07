import { Meta, StoryObj } from '@storybook/angular';

import { TestRtHybridTreeSelectorMatrixComponent } from './component/test-hybrid-tree-selector-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу. Кнопки строки
 * и подвал у селектора общие с `rt-tree-selector` и показаны в его матрицах.
 */
export default {
    title: 'Organisms/Forms/HybridTreeSelector',
    component: TestRtHybridTreeSelectorMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtHybridTreeSelectorMatrixComponent>;

type TStory = StoryObj<TestRtHybridTreeSelectorMatrixComponent>;

/** Прямая и подтверждаемая формы с группами «один лист», число выбранного без отметок — SC-UKV-698. */
export const Form: TStory = { args: { part: 'form' } };

/** Поиск оставляет листья групп «один лист» и их радио. */
export const Search: TStory = { args: { part: 'search' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
