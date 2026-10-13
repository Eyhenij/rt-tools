import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtSpeedMenuMatrixComponent } from './component/test-speed-menu-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно.
 */
export default {
    title: 'Organisms/Buttons/SpeedMenu',
    component: TestRtSpeedMenuMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtSpeedMenuMatrixComponent>;

type TStory = StoryObj<TestRtSpeedMenuMatrixComponent>;

/**
 * Открывает меню нажатием мыши: событие без счёта щелчков меню приняло бы за клавиатуру и поставило
 * фокус с подсказкой на первое действие.
 */
async function openMenu({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    await openStoryOverlay(canvasElement, { event: 'click' });
}

const OPEN_SNAPSHOT: { readonly snapshot: { readonly fullPage: boolean; readonly overlay: string } } = {
    snapshot: { fullPage: true, overlay: '.rt-speed-menu__panel' },
};

/** Ступени кнопки меню; действия на шаг меньше. */
export const Size: TStory = { args: { part: 'size' } };

/** Палитры кнопки меню и недоступное меню. */
export const Variant: TStory = { args: { part: 'variant' } };

/** Наведение и фокус стилизованы у кнопки внутри кнопки-значка: аддону передан спуск до неё. */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-speed-menu__trigger button') },
};

/** Открыто вверх: столбец над кнопкой, недоступное действие посередине. */
export const Up: TStory = { args: { part: 'open', direction: 'up' }, parameters: OPEN_SNAPSHOT, play: openMenu };

/** Открыто вниз: столбец под кнопкой. */
export const Down: TStory = { args: { part: 'open', direction: 'down' }, parameters: OPEN_SNAPSHOT, play: openMenu };

/** Открыто к началу строки: ряд слева от кнопки, подсказки сверху. */
export const Start: TStory = { args: { part: 'open', direction: 'start' }, parameters: OPEN_SNAPSHOT, play: openMenu };

/** Открыто к концу строки: ряд справа от кнопки. */
export const End: TStory = { args: { part: 'open', direction: 'end' }, parameters: OPEN_SNAPSHOT, play: openMenu };

/** Меню масштаба приложения, раскрытое вверх в материальном наборе. */
export const UpMaterial: TStory = { args: { part: 'open-material', direction: 'up' }, parameters: OPEN_SNAPSHOT, play: openMenu };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
