import { Meta, StoryObj } from '@storybook/angular';

import { TestRtHybridTreeMatrixComponent } from './component/test-hybrid-tree-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу. Контролов здесь
 * нет намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 */
export default {
    title: 'Organisms/Forms/HybridTree',
    component: TestRtHybridTreeMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtHybridTreeMatrixComponent>;

type TStory = StoryObj<TestRtHybridTreeMatrixComponent>;

/** Радио групп «один лист» рядом с флажками свободной группы — SC-UKV-691, SC-UKV-693. */
export const Single: TStory = { args: { part: 'single' } };

/** Отметки групп и число выбранного у группы без отметки — SC-UKV-697. */
export const Marks: TStory = { args: { part: 'marks' } };

/** «Выбрать всё» по свободным листьям, группы «один лист» не трогает — SC-UKV-694. */
export const SelectAll: TStory = { args: { part: 'select-all' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
