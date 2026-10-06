import { Meta, StoryObj } from '@storybook/angular';

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

/** Флажки, радио и режим без отметок — SC-UKV-676, SC-UKV-644. */
export const Mode: TStory = { args: { part: 'mode' } };

/** Отметка ветки по листьям и без каскада — SC-UKV-674, SC-UKV-675. */
export const Cascade: TStory = { args: { part: 'cascade' } };

/** «Выбрать всё» в трёх положениях — SC-UKV-645. */
export const SelectAll: TStory = { args: { part: 'select-all' } };

/** Отбор по слову и выделение совпадения — SC-UKV-647. */
export const Search: TStory = { args: { part: 'search' } };

/** Две причины пустоты — SC-UKV-651. */
export const Empty: TStory = { args: { part: 'empty' } };

/** Разметка приложения в конце строки — SC-UKV-650. */
export const NodeEnd: TStory = { args: { part: 'node-end' } };

/** Группы без отметки: по клику раскрываются, выбор идёт по листьям — SC-UKV-669. */
export const BranchMarks: TStory = { args: { part: 'branch-marks' } };

/** Метки узла, поиск без отбора и разметка приложения под подписью — SC-UKV-670, SC-UKV-671. */
export const NodeMeta: TStory = { args: { part: 'node-meta' } };

/**
 * Признак состояния стоит на самом хосте дерева, поэтому общий помощник с селектором потомка сюда
 * не подходит. Кольцо фокуса рисует хост, а наведение — строка: оно показано на «Казани».
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: {
        pseudo: {
            hover: "[data-story-state='hover'] .rt-tree__row[data-value='kzn']",
            focusVisible: "[data-story-state='focus-visible']",
        },
    },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
