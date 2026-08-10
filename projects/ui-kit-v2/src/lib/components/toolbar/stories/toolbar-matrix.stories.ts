import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtMost } from '../../../../showcase';
import { TestRtToolbarMatrixComponent } from './component/test-toolbar-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Панель объявляет свой порог ширины сама — 768 px, — поэтому у каждой матрицы есть второй
 * кадр: на нём слоты перестраиваются.
 */
export default {
    title: 'Components/Toolbar',
    component: TestRtToolbarMatrixComponent,
    parameters: {
        controls: { disable: true },
        snapshot: { widths: [storyWidthAtMost(768)] },
    },
} as Meta<TestRtToolbarMatrixComponent>;

type Story = StoryObj<TestRtToolbarMatrixComponent>;

export const Slots: Story = { args: { part: 'slots' } };

export const Fill: Story = { args: { part: 'fill' } };

/** Разницу видно только на узком кадре: в широком обе панели одинаковы. */
export const Dense: Story = { args: { part: 'dense' } };

export const Themes: Story = { args: { part: 'themes' } };
