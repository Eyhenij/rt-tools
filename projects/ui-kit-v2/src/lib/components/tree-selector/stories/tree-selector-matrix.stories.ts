import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTreeSelectorMatrixComponent } from './component/test-tree-selector-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу. Контролов здесь
 * нет намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 */
export default {
    title: 'Organisms/Forms/TreeSelector',
    component: TestRtTreeSelectorMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTreeSelectorMatrixComponent>;

type TStory = StoryObj<TestRtTreeSelectorMatrixComponent>;

/** Прямая и подтверждаемая формы, «Применить» выключено — SC-UKV-680, SC-UKV-682. */
export const Form: TStory = { args: { part: 'form' } };

/** Поиск по каждому слову, группа целиком и пустой итог — SC-UKV-677, SC-UKV-678. */
export const Search: TStory = { args: { part: 'search' } };

/** Заголовок, очистка, переключатель и контрол приложения — SC-UKV-684, SC-UKV-686. */
export const Controls: TStory = { args: { part: 'controls' } };

/** Флажки, радио и режим без отметок. */
export const Mode: TStory = { args: { part: 'mode' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
