import { Meta, StoryObj } from '@storybook/angular';

import { TestRtIconMatrixComponent } from './component/test-icon-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Icon',
    component: TestRtIconMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtIconMatrixComponent>;

type Story = StoryObj<TestRtIconMatrixComponent>;

/** Весь набор по категориям: имя — ось с тремя сотнями значений, выборкой её не показать. */
export const Catalog: Story = { args: { part: 'catalog' } };

export const Size: Story = { args: { part: 'size' } };

export const Color: Story = { args: { part: 'color' } };

export const Rotate: Story = { args: { part: 'rotate' } };

export const Themes: Story = { args: { part: 'themes' } };
