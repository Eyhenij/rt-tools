import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDataListMatrixComponent } from './component/test-data-list-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу. Контролов здесь нет
 * намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 */
export default {
    title: 'Organisms/DataList/DataList',
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

/** «Отметить все», счётчик вместо него и выбор по одной. */
export const Selection: TStory = { args: { part: 'selection' } };

/** Панель настройки колонок стоит в кадре прямо: в наложении поверх страницы её не снять. */
export const Settings: TStory = { args: { part: 'settings' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
