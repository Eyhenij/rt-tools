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

/** Знаки соцсетей: заливка в файле, ось цвета не действует — показываются парой тем. */
export const Social: TStory = { args: { part: 'social' } };
