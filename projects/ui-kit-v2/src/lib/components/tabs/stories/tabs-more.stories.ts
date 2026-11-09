import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTabsMoreComponent } from './component/test-tabs-more.component';

/** Панель рисуется в слое поверх страницы: кадр на всю страницу, и снимок ждёт её саму. */
const MENU_FRAME: { readonly fullPage: boolean; readonly overlay: string } = { fullPage: true, overlay: '[qa-dataid="tabs-more-menu"]' };

/** Открывает меню первой полосы. */
async function openMore({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    await document.fonts.ready;
    canvasElement.querySelector<HTMLElement>('[qa-dataid="tabs-more"]')?.click();
}

/** Режим «Ещё»: вкладки, которые не встают, уходят в меню. Контролов нет: все состояния видны сразу. */
export default {
    title: 'Molecules/Navigation/Tabs',
    component: TestRtTabsMoreComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTabsMoreComponent>;

type TStory = StoryObj<TestRtTabsMoreComponent>;

export const MoreWidths: TStory = { args: { part: 'widths' } };

export const MoreDense: TStory = { args: { part: 'dense' } };

export const MoreStates: TStory = { args: { part: 'states' }, parameters: { snapshot: MENU_FRAME }, play: openMore };

export const MoreClosable: TStory = { args: { part: 'closable' }, parameters: { snapshot: MENU_FRAME }, play: openMore };

/** Меню вкладки по правой кнопке: пункты объявляет приложение. */
export const MoreContextMenu: TStory = {
    args: { part: 'closable' },
    parameters: { snapshot: { fullPage: true, overlay: '[qa-dataid="tabs-context-menu"]' } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await document.fonts.ready;
        const tab: Element | null = canvasElement.querySelector('[data-tabitem="Главная"]');
        tab?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 200, clientY: 140 }));
    },
};

export const MoreLong: TStory = { args: { part: 'long' }, parameters: { snapshot: MENU_FRAME }, play: openMore };

export const MoreThemes: TStory = { args: { part: 'themes' } };
