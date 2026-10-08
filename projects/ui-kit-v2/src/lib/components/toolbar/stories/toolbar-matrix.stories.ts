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
    title: 'Organisms/Table/Toolbar',
    component: TestRtToolbarMatrixComponent,
    parameters: {
        controls: { disable: true },
        snapshot: { widths: [storyWidthAtMost(768)] },
    },
} as Meta<TestRtToolbarMatrixComponent>;

type TStory = StoryObj<TestRtToolbarMatrixComponent>;

export const Slots: TStory = { args: { part: 'slots' } };

export const Fill: TStory = { args: { part: 'fill' } };

/** Разницу видно только на узком кадре: в широком обе панели одинаковы. */
export const Dense: TStory = { args: { part: 'dense' } };

/** Длинный заголовок слева в плотной панели переносится и не выходит за край, SC-UKV-726. */
export const DenseTitle: TStory = { args: { part: 'dense-title' } };

/** Высота, поля, граница, промежуток и выравнивание центра — свойствами с тега панели, SC-UKV-573. */
export const Layout: TStory = { args: { part: 'layout' } };

export const Themes: TStory = { args: { part: 'themes' } };
