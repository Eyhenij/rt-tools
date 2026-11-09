import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtMost } from '../../../../showcase';
import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { TestRtPageHeaderVerticalComponent } from './component/test-page-header-vertical.component';

/**
 * Вертикальный вид `rt-page-header`: рейка 50 и панель раздела 220 поверх страницы, вместе с
 * компактной шапкой страницы, вкладками и ассистентом. Кадр на телефоне снимается отдельно: порог
 * рейки — запрос по ширине окна.
 */
export default {
    title: 'Molecules/Navigation/PageHeaderVertical',
    component: TestRtPageHeaderVerticalComponent,
    parameters: { controls: { disable: true }, layout: 'fullscreen', snapshot: { widths: [storyWidthAtMost(768)] } },
} as Meta<TestRtPageHeaderVerticalComponent>;

type TStory = StoryObj<TestRtPageHeaderVerticalComponent>;

const LONG_TITLE: string = 'Брони по всем объектам и партнёрам';

export const Rail: TStory = {};

export const PanelOpen: TStory = {
    parameters: { snapshot: { fullPage: true } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, {
            event: 'mouseenter',
            within: '[qa-dataid="rail-item"][data-id="docs"]',
            wait: 200,
        });
    },
};

export const ProfileOpen: TStory = {
    parameters: { snapshot: { fullPage: true } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { within: '[qa-dataid="page-user"]', wait: 200 });
    },
};

export const BarOneRow: TStory = { args: { bar: true } };

export const BarTwoRows: TStory = { args: { bar: true, pageTitle: LONG_TITLE, filterCount: 5 } };

export const BarMoreFilters: TStory = { args: { bar: true, pageTitle: LONG_TITLE, filterCount: 8 } };

export const Tabs: TStory = { args: { bar: true, tabs: 5 } };

export const TabsMore: TStory = { args: { bar: true, tabs: 30 } };

export const SingleTab: TStory = { args: { bar: true, tabs: 1 } };

export const Assistant: TStory = { args: { bar: true, assistant: true } };

export const TabsAssistant: TStory = { args: { bar: true, tabs: 30, assistant: true } };

export const FiltersApplied: TStory = { args: { bar: true, filtersActive: true } };

export const TabsPanelOpen: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { bar: true, tabs: 5 },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, {
            event: 'mouseenter',
            within: '[qa-dataid="rail-item"][data-id="docs"]',
            wait: 200,
        });
    },
};
