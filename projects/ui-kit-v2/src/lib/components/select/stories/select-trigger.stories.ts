import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtSelectTriggerComponent } from './component/test-select-trigger.component';

/**
 * Страница своего указателя выбора — входа `[rtSelectTrigger]`.
 *
 * Отдельная от матрицы выбора намеренно: указатель принимают обе семьи, выбор одного значения и
 * выбор нескольких, поэтому он не ось ни одной из них. Внутри матрицы он стоял одной строкой из
 * десяти, и найти его там можно было, только зная, что он там есть.
 *
 * Страницы с входами здесь нет и быть не может: содержимое указателя приезжает проекцией шаблона, а
 * витрина умеет подставлять значения, а не разметку.
 */
export default {
    title: 'Molecules/Forms/SelectTrigger',
    component: TestRtSelectTriggerComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtSelectTriggerComponent>;

type TStory = StoryObj<TestRtSelectTriggerComponent>;

/**
 * Пара указателей в одном кадре: зашитый китом и свой, объявленный шаблоном. Порознь ни одна
 * половина не показывает, чем она отличается от другой.
 */
export const Against: TStory = { args: { part: 'against' } };

/** Один вход на обе семьи: разница у них только внутри кнопки — подпись против ряда меток. */
export const Families: TStory = { args: { part: 'families' } };

/**
 * Состояния своего указателя. Взяты оба фокуса: у зашитого указателя полевое кольцо рисуется и на
 * `:focus`, а у своего его нет ни там, ни на ходе клавишами — вместо кольца обводка по содержимому
 * кнопки. Признак спускается до кнопки: правила написаны на ней, а не на хосте.
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-select__trigger') },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };

/**
 * Виды кнопки. Разметку объявляет приложение, и кит её не ограничивает: значок с названием и
 * количеством, один значок, подпись со стрелкой, метка, подпись со значением.
 */
export const Buttons: TStory = { args: { part: 'buttons' } };

/**
 * Длинный список в панели. Прокрутки внутри нет: панель открывается целиком — так и было
 * заказано. Кнопка при этом узкая, и панель её шириной не мерится.
 */
export const PanelLong: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'long' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { key: 'ArrowDown' });
    },
};

/** Длинные подписи: панель мерится содержимым и выходит заметно шире кнопки из одного значка. */
export const PanelWide: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'wide' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { key: 'ArrowDown' });
    },
};

/** Назначенный предел высоты — `panelMaxHeight`. Вместе с ним и появляется прокрутка внутри. */
export const PanelCapped: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'capped' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { key: 'ArrowDown' });
    },
};

/** Прежнее поведение — `panelWidth="trigger"`: панель ровно по ширине поля, как было до правки. */
export const PanelByTrigger: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'by-trigger' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { key: 'ArrowDown' });
    },
};
