import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotWidths } from '../../../../showcase/story-snapshot';
import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtDataTableMatrixComponent } from './component/test-data-table-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу. Контролов здесь нет
 * намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 *
 * Оси полос прокрутки тут нет: их размер приходит с корня страницы, и ставит его список — у
 * таблицы самой такой оси не существует.
 */
export default {
    title: 'Organisms/Tables & Lists/DataTable',
    component: TestRtDataTableMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDataTableMatrixComponent>;

type TStory = StoryObj<TestRtDataTableMatrixComponent>;

/** Каждый вид колонки по разу: так видно, чем готовая ячейка рисует значение каждого вида. */
export const Columns: TStory = { args: { part: 'columns' } };

export const Sort: TStory = { args: { part: 'sort' } };

/**
 * Строку отбора таблица рисует сама, по настройке колонок: колонка без отбора держит пустое
 * место, а заданное условие строк не сужает — набор уходит приложению целиком.
 */
export const Filters: TStory = { args: { part: 'filters' } };

/** Выбор многих даёт флажки и флажок страницы, выбор по одной — радиокнопки и шапку без флажка. */
export const Selection: TStory = { args: { part: 'selection' } };

/**
 * Полоса действий скрыта, пока строка не наведена: в неподвижном кадре наведение ставит аддон
 * витрины — признак стоит на ячейке, а правило со `:hover` написано на строке таблицы.
 */
export const Actions: TStory = {
    args: { part: 'actions' },
    parameters: { pseudo: storyPseudoParameters('.rt-data-table__row') },
};

export const Clickable: TStory = { args: { part: 'clickable' } };

export const Presets: TStory = { args: { part: 'presets' } };

/**
 * Кадр на окне 1100 px: при нём половины наборов уже узкие, а полоса страниц ещё считает себя
 * широкой — тулбар и полоса страниц вылезали из карточки темы на соседнюю.
 */
export const Themes: TStory = { args: { part: 'themes' }, parameters: storySnapshotWidths(1100) };
