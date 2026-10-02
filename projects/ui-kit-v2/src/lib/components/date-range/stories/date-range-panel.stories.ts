import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDateRangePanelMatrixComponent } from './component/test-date-range-panel-matrix.component';

/**
 * Панель, которую открывает поле диапазона. Поле кладёт её в поповер, на узком экране — в нижнюю
 * шторку; здесь она стоит без оверлея, чтобы попасть в пару наборов и в пару тем. «Сегодня»
 * витрины — 20 октября 2026 года, его задаёт вход панели `now`.
 */
export default {
    title: 'Organisms/Forms/DateRangePanel',
    component: TestRtDateRangePanelMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDateRangePanelMatrixComponent>;

type TStory = StoryObj<TestRtDateRangePanelMatrixComponent>;

/** Выбранный диапазон: начало, конец и дни между ними, итог с числом дней, «Применить» включена. */
export const Selected: TStory = { args: { part: 'selected' } };

/**
 * Выбор даты окончания: `play` ставит начало кликом и наводит указатель на день после него —
 * будущий диапазон тянется до этого дня, итог просит дату окончания, «Применить» выключена.
 */
export const Selecting: TStory = {
    args: { part: 'selecting' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        for (const panel of Array.from(canvasElement.querySelectorAll<HTMLElement>('rt-date-range-panel'))) {
            panel.querySelector<HTMLButtonElement>('[data-iso="2026-10-12"]')?.click();
            panel.querySelector<HTMLButtonElement>('[data-iso="2026-10-19"]')?.dispatchEvent(new MouseEvent('mouseenter'));
        }
        await new Promise<void>((resolve: () => void): void => {
            requestAnimationFrame((): void => resolve());
        });
        if (canvasElement.querySelector('[data-iso="2026-10-13"][data-state="in-range"]') === null) {
            throw new Error('DateRangePanel/Selecting: the future range did not appear');
        }
    },
};

/** Дни за границами выключены, листание упирается в месяцы границ, варианты за границей выключены. */
export const Bounds: TStory = { args: { part: 'bounds' } };

/** Раскладка нижней шторки: заголовок, варианты строкой, один месяц, дни под палец. */
export const Sheet: TStory = { args: { part: 'sheet' } };

/** Светлая и тёмная темы рядом: широкая панель с двумя месяцами. */
export const Themes: TStory = { args: { part: 'themes' } };
