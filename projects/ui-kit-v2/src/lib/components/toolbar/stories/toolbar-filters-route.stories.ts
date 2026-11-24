import { Meta, StoryObj } from '@storybook/angular';

import { TestRtToolbarFiltersRouteComponent } from './component/test-rt-toolbar-filters-route.component';

/** Окно телефона, как у историй отборов за кнопкой: 375 в ширину. */
const PHONE_375: { width: number; height: number } = { width: 375, height: 812 };

/** Маршрутная панель отборов в правой зоне каркаса: без неё кадр снимался бы пустым. */
const ROUTE_PANEL: string = 'rt-toolbar-filters-route-aside .rt-aside';

/**
 * Панель отборов, которую приложение открывает своим маршрутом: каркас `rt-container` с аутлетом
 * `ro`, полоса с `filtersPanel="app"`, маршрут `rt-toolbar-filters-route-aside`. Вид панели тот же,
 * что у панели кита.
 */
export default {
    title: 'Organisms/Table/ToolbarFiltersRoute',
    component: TestRtToolbarFiltersRouteComponent,
    globals: { viewport: { value: 'narrow' } },
    parameters: {
        layout: 'fullscreen',
        controls: { disable: true },
        snapshot: { fullPage: true, viewport: PHONE_375 },
    },
} as Meta<TestRtToolbarFiltersRouteComponent>;

type TStory = StoryObj<TestRtToolbarFiltersRouteComponent>;

/**
 * Кнопка фильтров сообщила `filtersOpen`, приложение перешло на маршрут панели в аутлете `ro`,
 * SC-UKV-1773, SC-UKV-1774.
 */
export const AppPanelOpen: TStory = {
    parameters: { snapshot: { fullPage: true, viewport: PHONE_375, overlay: ROUTE_PANEL } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await document.fonts.ready;
        await new Promise<void>((resolve: () => void): void => {
            setTimeout(resolve, 400);
        });
        canvasElement.querySelector<HTMLElement>('[qa-dataid="toolbar-filters-trigger"] [qa-dataid="icon-button-control"]')?.click();
        await new Promise<void>((resolve: () => void): void => {
            setTimeout(resolve, 600);
        });
    },
};
