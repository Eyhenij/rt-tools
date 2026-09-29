import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDatePanelMatrixComponent } from './component/test-date-panel-matrix.component';

/**
 * Панель, которую открывает поле. Поле кладёт её в поповер, на узком экране — в нижнюю шторку;
 * здесь она стоит без оверлея, чтобы попасть в пару наборов и в пару тем. «Сегодня» витрины —
 * 10 марта 2026 года, его задаёт вход панели `now`.
 */
export default {
    title: 'Molecules/Forms/DatePicker',
    component: TestRtDatePanelMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDatePanelMatrixComponent>;

type TStory = StoryObj<TestRtDatePanelMatrixComponent>;

/** Дата, время и дата со временем: месяц, колонки часов и минут, подвал по типу. */
export const Panel: TStory = { args: { part: 'types' } };

/** Дни и время за границами выключены, листание упирается в месяц границы, «Сегодня» выключено. */
export const PanelBounds: TStory = { args: { part: 'bounds' } };

/** Выбор месяца и года: его открывает нажатие на заголовок месяца, и `play` нажимает его сам. */
export const PanelMonths: TStory = {
    args: { part: 'months' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        for (const title of Array.from(canvasElement.querySelectorAll<HTMLButtonElement>('[qa-dataid="calendar-month-title"]'))) {
            title.click();
        }
        await new Promise<void>((resolve: () => void): void => {
            requestAnimationFrame((): void => resolve());
        });
        if (canvasElement.querySelector('[qa-dataid="date-panel-months"]') === null) {
            throw new Error('PanelMonths: the choice of months did not open');
        }
    },
};

/** Раскладка нижней шторки: дни под палец, у даты со временем — переключатель «Дата | Время». */
export const PanelSheet: TStory = { args: { part: 'sheet' } };

/** Светлая и тёмная темы рядом. */
export const PanelThemes: TStory = { args: { part: 'themes' } };
