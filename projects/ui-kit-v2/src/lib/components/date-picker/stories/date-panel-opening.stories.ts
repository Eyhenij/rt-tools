import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { TestRtDatePanelOpeningComponent } from './component/test-date-panel-opening.component';

/**
 * Панель без текстового поля: кнопка открывает выбор даты и времени, значение возвращается
 * событием `picked`. Кнопку нажимает `play`, панель стоит в оверлее, поэтому кадр снимает всю страницу.
 */
export default {
    title: 'Molecules/Forms/DatePanelOpening',
    component: TestRtDatePanelOpeningComponent,
    parameters: {
        controls: { disable: true },
        snapshot: { fullPage: true },
    },
} as Meta<TestRtDatePanelOpeningComponent>;

type TStory = StoryObj<TestRtDatePanelOpeningComponent>;

/** Шторка не живёт в контейнере оверлеев: снимок сверяет открытую панель по этому узлу. */
const SHEET_PANEL: string = 'rt-bottom-sheet rt-date-panel';

/**
 * Узкое окно. Календарь прячет второй месяц по ширине окна, и на широком окне это правило не
 * срабатывает. Ширина вмещает телефон 360 с полями витрины по 16 и лежит ниже порога 640.
 */
const PHONE_WINDOW: { readonly width: number; readonly height: number } = { width: 392, height: 812 };

/** Параметры снимка шторки: вся страница, панель шторки и окно телефона. */
const SHEET_SNAPSHOT: { snapshot: { fullPage: boolean; overlay: string; viewport: typeof PHONE_WINDOW } } = {
    snapshot: { fullPage: true, overlay: SHEET_PANEL, viewport: PHONE_WINDOW },
};

async function open({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    await openStoryOverlay(canvasElement);
}

/** Нижняя граница витрины: дни до 10 марта зачёркнуты. */
const STORY_MIN: string = '2026-03-10T00:00';

/** Широкий экран: панель в поповере под кнопкой, поверхность даёт потребитель. */
export const Popover: TStory = { args: { place: 'popover', min: STORY_MIN }, play: open };

/** Широкий экран: поповер открывает чужая кнопка-иконка с часами. */
export const PopoverFromIconButton: TStory = { args: { place: 'icon', min: STORY_MIN }, play: open };

/** Узкий экран: дата, панель с входом `sheet` в `rt-bottom-sheet`. */
export const BottomSheet: TStory = {
    args: { place: 'sheet', type: 'date', value: '2026-03-15' },
    parameters: SHEET_SNAPSHOT,
    play: open,
};

/** Узкий экран: дата без кнопки «Сегодня», подвала у панели нет. */
export const BottomSheetWithoutToday: TStory = {
    args: { place: 'sheet', type: 'date', value: '2026-03-15', isTodayButtonShown: false },
    parameters: SHEET_SNAPSHOT,
    play: open,
};

/**
 * Узкий экран: дата со временем, переключатель «Дата | Время» над месяцем. Заголовок шторки даёт
 * потребитель, выбранное значение стоит слева в подвале.
 */
export const BottomSheetDateTime: TStory = {
    args: { place: 'sheet', min: STORY_MIN, sheetTitle: 'Когда отправить' },
    parameters: SHEET_SNAPSHOT,
    play: open,
};
