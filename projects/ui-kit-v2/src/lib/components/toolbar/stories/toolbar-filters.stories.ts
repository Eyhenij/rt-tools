import { Meta, StoryObj } from '@storybook/angular';

import { TestRtToolbarFiltersComponent } from './component/test-toolbar-filters.component';

/** Окно телефона из макета «Телефон · Toolbar · фильтры за кнопкой»: 375 в ширину. */
const PHONE_375: { width: number; height: number } = { width: 375, height: 812 };

/**
 * Узел, по которому видно, что панель отборов открыта: без него кадр снимался бы пустым. На 375
 * панель открывается шторкой во всю высоту, и видна именно шторка.
 */
const FILTERS_PANEL: string = '.rt-bottom-sheet__panel';

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

/** Отбор выключен: кнопка фильтров последней в ряду, после настроек таблицы, без точки, SC-UKV-1086. */
export const FilterOff: TStory = { args: { part: 'off' } };

/** Отбор включён: точка в углу значка, полоса её не режет, SC-UKV-1088. */
export const FilterOn: TStory = { args: { part: 'on' } };

/**
 * Ровно 1080: отборы ещё стоят в строке, каждый шириной по своей подсказке, без многоточия,
 * SC-UKV-1772, SC-UKV-1779.
 */
export const InRowAt1080: TStory = {
    args: { part: 'off' },
    parameters: { snapshot: { fullPage: true, viewport: { width: 1080, height: 64 } } },
};

/** 1079: вместо отборов кнопка фильтров последней в ряду кнопок, SC-UKV-1772. */
export const ButtonAt1079: TStory = {
    args: { part: 'off' },
    parameters: { snapshot: { fullPage: true, viewport: { width: 1079, height: 64 } } },
};

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
