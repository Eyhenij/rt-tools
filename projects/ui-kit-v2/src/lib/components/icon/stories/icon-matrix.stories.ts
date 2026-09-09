import { Meta, StoryObj } from '@storybook/angular';

import { TestRtIconMatrixComponent } from './component/test-icon-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Atoms/Icon',
    component: TestRtIconMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtIconMatrixComponent>;

type TStory = StoryObj<TestRtIconMatrixComponent>;

/** Весь набор по категориям: имя — ось с тремя сотнями значений, выборкой её не показать. */
export const Catalog: TStory = { args: { part: 'catalog' } };

export const Size: TStory = { args: { part: 'size' } };

export const Color: TStory = { args: { part: 'color' } };

export const Rotate: TStory = { args: { part: 'rotate' } };

/** Знаки соцсетей: заливка в файле, ось цвета не действует — показываются парой тем. */
export const Social: TStory = { args: { part: 'social' } };

// Дальше — про второй набор рисунков, включаемый признаком `data-preset='material'`. Истории
// разведены по вопросу, а не по слову «материальный»: первые две показывают оба набора рядом и
// зовутся так же, как такие же истории у остальных семейств кита; следующие три показывают сам
// материальный набор, и в них базового рисунка нет вовсе.

/**
 * Оба набора рядом: одно и то же имя своим рисунком и материальным. Набор выбирается признаком
 * набора оформления — кодом его никто не переключает.
 */
export const Presets: TStory = { args: { part: 'presets' } };

/**
 * Работают ли оси в обоих наборах: размер и цвет в обеих половинах. Набор их не меняет — рисунок
 * обоих наборов красится `currentColor` и тянется своим `viewBox`.
 */
export const PresetAxes: TStory = { args: { part: 'preset-axes' } };

/** Что лежит в материальном наборе: двадцать восемь имён, закрытых рисунком Material. */
export const MaterialSet: TStory = { args: { part: 'material-set' } };

/** Держится ли материальный набор в тёмной теме. Тёмная тема выигрывает у набора — это её правило. */
export const MaterialThemes: TStory = { args: { part: 'material-themes' } };

/**
 * Переезжающему с первого кита: чем закрыто каждое его имя. Пара выбрана по смыслу, и судить её
 * можно только глазами — проверка держит лишь то, что имя существует и файл на месте. Прочерк —
 * имя, которому рисунка в наборе нет вовсе. Рисунки здесь и свои, и материальные: страница про
 * соответствие имён, а не про один из наборов.
 */
export const MigrationMap: TStory = { args: { part: 'migration-map' } };

export const Themes: TStory = { args: { part: 'themes' } };
