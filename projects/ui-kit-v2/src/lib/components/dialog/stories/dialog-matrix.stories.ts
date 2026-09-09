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
    title: 'Organisms/Dialog/Dialog',
    component: TestRtDialogMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDialogMatrixComponent>;

type TStory = StoryObj<TestRtDialogMatrixComponent>;

export const Size: TStory = { args: { part: 'size' } };

/** Своя ширина перекрывает размер — рядом видно, что перекрывает и правда. */
export const Width: TStory = { args: { part: 'width' } };

/** Шапка и подвал необязательны: без них окно выглядит иначе. */
export const Parts: TStory = { args: { part: 'parts' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
