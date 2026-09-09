import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtMost } from '../../../../showcase';
import { TestRtTableMatrixComponent } from './component/test-table-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Второй кадр — на узком показе: там таблица переключается на карточки, и это другая разметка,
 * а не перестроенная стилями таблица. Порог таблица берёт у службы порогов ширины.
 */
export default {
    title: 'Organisms/Table/Table',
    component: TestRtTableMatrixComponent,
    parameters: {
        controls: { disable: true },
        snapshot: { widths: [storyWidthAtMost(768)] },
    },
} as Meta<TestRtTableMatrixComponent>;

type TStory = StoryObj<TestRtTableMatrixComponent>;

export const Density: TStory = { args: { part: 'density' } };

/** Первая загрузка и догрузка стоят рядом: порознь их не различить. */
export const Loading: TStory = { args: { part: 'loading' } };

export const Sort: TStory = { args: { part: 'sort' } };

export const Empty: TStory = { args: { part: 'empty' } };

export const Clickable: TStory = { args: { part: 'clickable' } };

/** Своя карточка против авто-карточки: обе видны только на узком кадре — на широком там таблица. */
export const Cards: TStory = { args: { part: 'cards' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
