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

export const Themes: TStory = { args: { part: 'themes' } };

// Материальный набор — второй набор рисунков, включаемый признаком `data-preset='material'`.
// Историй у него столько же, сколько осей у своего набора, и каждая отвечает одному вопросу:
// что в наборе лежит, чем он отличается от своего, работают ли оси, держится ли тёмная тема и
// чем закрыто каждое имя первого кита.

/** Что лежит в материальном наборе: двадцать восемь имён, закрытых рисунком Material. */
export const MaterialCatalog: TStory = { args: { part: 'material-catalog' } };

/**
 * Чем материальный рисунок отличается от своего: одно и то же имя в двух наборах рядом. Набор
 * выбирается признаком набора оформления — кодом его никто не переключает.
 */
export const MaterialPairs: TStory = { args: { part: 'presets' } };

/**
 * Работают ли оси в материальном наборе: размер и цвет в обеих половинах. Набор их не меняет —
 * рисунок обоих наборов красится `currentColor` и тянется своим `viewBox`.
 */
export const MaterialAxes: TStory = { args: { part: 'preset-axes' } };

/** Держится ли материальный набор в тёмной теме. Тёмная тема выигрывает у набора — это её правило. */
export const MaterialThemes: TStory = { args: { part: 'material-themes' } };

/**
 * Чем закрыто каждое имя первого кита. Пара выбрана по смыслу, и судить её можно только глазами:
 * проверка держит лишь то, что имя существует и файл на месте. Прочерк — имя, которому рисунка в
 * наборе нет вовсе.
 */
export const MaterialMap: TStory = { args: { part: 'material' } };

/** Знаки соцсетей: заливка в файле, ось цвета не действует — показываются парой тем. */
export const Social: TStory = { args: { part: 'social' } };
