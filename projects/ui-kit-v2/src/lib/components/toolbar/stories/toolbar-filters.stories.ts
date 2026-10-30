import { Meta, StoryObj } from '@storybook/angular';

import { TestRtToolbarFiltersComponent } from './component/test-toolbar-filters.component';

/** Окно телефона из макета «Телефон · Toolbar · фильтры за кнопкой»: 375 в ширину. */
const PHONE_375: { width: number; height: number } = { width: 375, height: 812 };

/** Узел, по которому видно, что панель отборов открыта: без него кадр снимался бы пустым. */
const FILTERS_PANEL: string = 'rt-toolbar-filters-aside';

/**
 * Отборы списка за кнопкой — три состояния узкого места: отбор выключен, включён с точкой в углу
 * значка, панель отборов открыта. Окно узкое с первого кадра: кнопку рисует служба ширины кита, и
 * узел, появившийся после смены ширины, классов состояний не получил бы.
 */
export default {
    title: 'Organisms/Table/ToolbarFilters',
    component: TestRtToolbarFiltersComponent,
    globals: { viewport: { value: 'narrow' } },
    parameters: {
        // Полоса стоит во всю ширину окна, как в списке: поля витрины сдвинули бы её от краёв кадра.
        layout: 'fullscreen',
        controls: { disable: true },
        snapshot: { fullPage: true, viewport: PHONE_375 },
    },
} as Meta<TestRtToolbarFiltersComponent>;

type TStory = StoryObj<TestRtToolbarFiltersComponent>;

/** Отбор выключен: кнопка фильтров первой в ряду, без точки, SC-UKV-1086. */
export const FilterOff: TStory = { args: { part: 'off' } };

/** Отбор включён: точка в углу значка, полоса её не режет, SC-UKV-1088. */
export const FilterOn: TStory = { args: { part: 'on' } };

/** Панель отборов открыта нажатием на кнопку, SC-UKV-1089. */
export const PanelOpen: TStory = {
    args: { part: 'on' },
    parameters: { snapshot: { fullPage: true, viewport: PHONE_375, overlay: FILTERS_PANEL } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        canvasElement.querySelector<HTMLElement>('[qa-dataid="toolbar-filters-trigger"] [qa-dataid="icon-button-control"]')?.click();
        await new Promise<void>((resolve: () => void): void => {
            setTimeout(resolve, 400);
        });
    },
};
