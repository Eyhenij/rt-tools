import { Meta, StoryObj } from '@storybook/angular';

import { TestRtChatFillComponent } from './component/test-chat-fill.component';

/**
 * Чат с `fill` в рабочем месте с карточками. До 1080 над чатом стоит полоса «назад / сведения», и
 * поле ввода остаётся у низа колонки и с длинной лентой. Кадры — по обе стороны порогов рабочего
 * места: 375, 480, 768, 769 и шире 1080.
 *
 * Каждая ширина — своя история со своим окном, а не кадр порога: рабочее место, снятое сначала
 * широким, при сужении окна в снимщике оставалось в две колонки, и кадр 375 выходил шириной 867.
 */
export default {
    title: 'Organisms/Chat/Fill',
    component: TestRtChatFillComponent,
    parameters: { controls: { disable: true }, layout: 'fullscreen' },
} as Meta<TestRtChatFillComponent>;

type TStory = StoryObj<TestRtChatFillComponent>;

/** Кадр всей страницы при окне заданной ширины и высоты 720. */
function frame(width: number): { snapshot: { fullPage: boolean; viewport: { width: number; height: number } } } {
    return { snapshot: { fullPage: true, viewport: { width, height: 720 } } };
}

/** Сорок реплик, 375: лента длиннее колонки, прокручивается внутри, поле ввода у низа. */
export const Long375: TStory = { args: { long: true }, parameters: frame(375) };

/** Сорок реплик, 480. */
export const Long480: TStory = { args: { long: true }, parameters: frame(480) };

/** Сорок реплик, 768 — последняя ширина одной колонки. */
export const Long768: TStory = { args: { long: true }, parameters: frame(768) };

/** Сорок реплик, 769 — первая ширина двух колонок. */
export const Long769: TStory = { args: { long: true }, parameters: frame(769) };

/** Сорок реплик, 1081 — полосы «назад / сведения» над чатом уже нет. */
export const Long1081: TStory = { args: { long: true }, parameters: frame(1081) };

/** Одна реплика, 375: раскладка та же, что и до правки. */
export const Short375: TStory = { args: { long: false }, parameters: frame(375) };

/** Одна реплика, 1081. */
export const Short1081: TStory = { args: { long: false }, parameters: frame(1081) };
