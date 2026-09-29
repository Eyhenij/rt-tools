import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotWidths } from '../../../../showcase/story-snapshot';
import { TestRtDataListMatrixComponent } from './component/test-data-list-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу. Контролов здесь нет
 * намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 */
export default {
    title: 'Organisms/Material Dynamic List/DataList',
    // Тема первого кита на всю страницу: таблица первого кита рисуется как на его витрине.
    globals: { preset: 'first-kit-theme' },
    component: TestRtDataListMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDataListMatrixComponent>;

type TStory = StoryObj<TestRtDataListMatrixComponent>;

/** Первая загрузка и дозагрузка стоят рядом: порознь их не различить. */
export const Loading: TStory = { args: { part: 'loading' } };

/** Пустой список и пустой ответ на заданное условие — разные вещи, и выглядят они по-разному. */
export const Placeholder: TStory = { args: { part: 'placeholder' } };

/** Полосы страниц нет вовсе, пока всё помещается на самую маленькую страницу. */
export const Pagination: TStory = { args: { part: 'pagination' } };

export const Filters: TStory = { args: { part: 'filters' } };

/** Вид `fill` у поиска и полей отбора; вид `outline` показывает история строки отбора. */
export const Appearance: TStory = { args: { part: 'appearance' } };

/** «Отметить все», счётчик вместо него и выбор по одной. */
export const Selection: TStory = { args: { part: 'selection' } };

/** Панель настройки колонок стоит в кадре прямо: в наложении поверх страницы её не снять. */
export const Settings: TStory = { args: { part: 'settings' } };

/**
 * Узкая коробка, а не узкое окно: порог кита — запрос к ширине окна, и окно показа узким не
 * бывает. Кадр отвечает на другое: карточек у таблицы нет, восемь колонок остаются таблицей.
 */
export const Narrow: TStory = { args: { part: 'narrow' } };

export const Presets: TStory = { args: { part: 'presets' } };

/**
 * Кадр на окне 1100 px: при нём половины наборов уже узкие, а полоса страниц ещё считает себя
 * широкой — тулбар и полоса страниц вылезали из карточки темы на соседнюю.
 */
export const Themes: TStory = { args: { part: 'themes' }, parameters: storySnapshotWidths(1100) };

/**
 * Тема Material со страницы: материальный набор берёт её цвета, как первый кит. Тема та же, что на
 * витрине первого кита, — фиолетовая палитра Material.
 */
export const MaterialTheme: TStory = { args: { part: 'material-theme' } };
