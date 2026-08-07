import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDialogMatrixComponent } from './component/test-dialog-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Окно стоит прямо в разметке: в оверлей его уносит служба, а сам компонент — обычная коробка.
 * Так размеры встают рядом, а светло-тёмная пара ловит окно целиком.
 */
export default {
    title: 'Components/Dialog',
    component: TestRtDialogMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDialogMatrixComponent>;

type Story = StoryObj<TestRtDialogMatrixComponent>;

export const Size: Story = { args: { part: 'size' } };

/** Своя ширина перекрывает размер — рядом видно, что перекрывает и правда. */
export const Width: Story = { args: { part: 'width' } };

/** Шапка и подвал необязательны: без них окно выглядит иначе. */
export const Parts: Story = { args: { part: 'parts' } };

export const Themes: Story = { args: { part: 'themes' } };
