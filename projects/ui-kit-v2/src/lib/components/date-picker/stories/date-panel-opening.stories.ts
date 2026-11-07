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

async function open({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    await openStoryOverlay(canvasElement);
}

/** Широкий экран: панель в поповере под кнопкой, поверхность даёт потребитель. */
export const Popover: TStory = { args: { place: 'popover' }, play: open };

/** Узкий экран: дата, панель с входом `sheet` в `rt-bottom-sheet`. */
export const BottomSheet: TStory = {
    args: { place: 'sheet', type: 'date', value: '2026-03-15' },
    parameters: { snapshot: { fullPage: true, overlay: SHEET_PANEL } },
    play: open,
};

/** Узкий экран: дата со временем, переключатель «Дата | Время» над месяцем. */
export const BottomSheetDateTime: TStory = {
    args: { place: 'sheet' },
    parameters: { snapshot: { fullPage: true, overlay: SHEET_PANEL } },
    play: open,
};
