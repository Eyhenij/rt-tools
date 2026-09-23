import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtMost } from '../../../../showcase';
import { TestRtDynamicListMatrixComponent } from './component/test-dynamic-list-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Узкий вид семья объявляет медиазапросом по порогу кита в 1080 точек, а не входом: увидеть его
 * можно только на кадре порога, и потому у показа объявлена ширина.
 */
export default {
    title: 'Organisms/Table/DynamicList',
    component: TestRtDynamicListMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDynamicListMatrixComponent>;

type TStory = StoryObj<TestRtDynamicListMatrixComponent>;

/** Заказанные действия панели: все три, сбрасывать нечего, один поиск. */
export const Toolbar: TStory = { args: { part: 'toolbar' } };

/** Две причины пустоты: в разделе пусто и отбор ничего не нашёл. */
export const Empty: TStory = { args: { part: 'empty' } };

/** Узкий вид: отбор встаёт над действиями, поле поиска занимает всю ширину. */
export const Narrow: TStory = {
    args: { part: 'narrow' },
    parameters: { snapshot: { widths: [storyWidthAtMost(1080)] } },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
