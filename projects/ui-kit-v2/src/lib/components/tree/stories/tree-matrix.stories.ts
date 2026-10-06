import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtTreeMatrixComponent } from './component/test-tree-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу. Контролов
 * здесь нет намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 */
export default {
    title: 'Organisms/Forms/Tree',
    component: TestRtTreeMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTreeMatrixComponent>;

type TStory = StoryObj<TestRtTreeMatrixComponent>;

/** Флажки, радио и режим без отметок — SC-UKV-643, SC-UKV-644. */
export const Mode: TStory = { args: { part: 'mode' } };

/** Отметка ветки по листьям и без каскада — SC-UKV-641, SC-UKV-642. */
export const Cascade: TStory = { args: { part: 'cascade' } };

/** «Выбрать всё» в трёх положениях — SC-UKV-645. */
export const SelectAll: TStory = { args: { part: 'select-all' } };

/** Отбор по слову и выделение совпадения — SC-UKV-647. */
export const Search: TStory = { args: { part: 'search' } };

/** Две причины пустоты — SC-UKV-651. */
export const Empty: TStory = { args: { part: 'empty' } };

/** Разметка приложения в конце строки — SC-UKV-650. */
export const NodeEnd: TStory = { args: { part: 'node-end' } };

/** Кольцо фокуса рисует сам хост дерева: признак ставится на него. */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-tree') },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
