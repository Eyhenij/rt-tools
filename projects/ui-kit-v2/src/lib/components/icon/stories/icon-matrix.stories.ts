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

/**
 * Чем закрывается значок первого кита. Пара выбрана по смыслу, и судить её можно только глазами:
 * проверка держит лишь то, что имя существует и файл на месте. Прочерк — имя, которому рисунка в
 * наборе нет вовсе.
 */
export const MaterialMap: TStory = { args: { part: 'material' } };

/**
 * Один и тот же значок в двух наборах рядом. Набор рисунков выбирается вместе с набором
 * оформления: признак стоит на половине, и кит меняет рисунок сам — кодом его никто не
 * переключает.
 */
export const MaterialGlyphs: TStory = { args: { part: 'presets' } };

/**
 * Оси размера и цвета в обоих наборах. Набор их не меняет: рисунок обоих наборов красится
 * `currentColor` и тянется своим `viewBox`. Показывается отдельной историей, а не рядом с парой
 * рисунков: обвязка снимает первый корень показа на странице, и вторая пара в кадр не попадала.
 */
export const MaterialAxes: TStory = { args: { part: 'preset-axes' } };

/** Знаки соцсетей: заливка в файле, ось цвета не действует — показываются парой тем. */
export const Social: TStory = { args: { part: 'social' } };
