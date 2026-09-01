import { Meta, StoryObj } from '@storybook/angular';

import { TestSideMenuWrapperComponent } from './component/test-side-menu-wrapper.component';

export default {
    title: 'Components/SideMenu',
    component: TestSideMenuWrapperComponent,
} as Meta<TestSideMenuWrapperComponent>;

type TStory = StoryObj<TestSideMenuWrapperComponent>;

async function waitForField(canvasElement: HTMLElement, attempts: number = 50): Promise<HTMLInputElement | null> {
    for (let attempt: number = 0; attempt < attempts; attempt += 1) {
        const field: HTMLInputElement | null = canvasElement.querySelector('[qa-dataid="side-menu-search"]');

        if (field !== null) {
            return field;
        }

        await new Promise<void>((resolve: () => void): void => {
            requestAnimationFrame(() => resolve());
        });
    }

    return null;
}

/**
 * Набор запроса в поле подменю. Ждётся сам узел поля, а не отсчёт времени: на занятой машине
 * отсчёт промахивается, и кадр уходит без набранного запроса.
 */
async function typeInSubMenuSearch(canvasElement: HTMLElement, query: string): Promise<void> {
    const field: HTMLInputElement | null = await waitForField(canvasElement);

    if (field === null) {
        throw new Error('Поле поиска подменю не появилось: показывать нечего, и кадр был бы пустым');
    }

    field.value = query;
    field.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Открытие подменю нажатием пункта. Ждётся сам пункт, а не отсчёт времени, и ждётся потом шапка
 * подменю: без неё кадр уходит с закрытым ящиком и о переключателе не говорит ничего.
 */
async function openSubMenuByClick(canvasElement: HTMLElement, attempts: number = 50): Promise<void> {
    for (let attempt: number = 0; attempt < attempts; attempt += 1) {
        const item: HTMLElement | null = canvasElement.querySelector('a.rtui-side-menu-item');

        if (item !== null) {
            item.click();
            break;
        }

        await new Promise<void>((resolve: () => void): void => {
            requestAnimationFrame(() => resolve());
        });
    }

    for (let attempt: number = 0; attempt < attempts; attempt += 1) {
        const head: HTMLElement | null = canvasElement.querySelector('.rtui-sub-side-menu-head');

        if (head !== null && head.getBoundingClientRect().x >= 0) {
            return;
        }

        await new Promise<void>((resolve: () => void): void => {
            requestAnimationFrame(() => resolve());
        });
    }

    throw new Error('Подменю не открылось: кадр показал бы закрытый ящик вместо переключателя');
}

export const Default: TStory = {
    args: {
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
};

export const Mobile: TStory = {
    globals: { viewport: { value: 'narrow' } },
    args: {
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
};

export const DefaultActiveMenu: TStory = {
    args: {
        activeMenuIds: [24, 26, 29, 33, 35],
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
};

export const MobileActiveMenu: TStory = {
    globals: { viewport: { value: 'narrow' } },
    args: {
        activeMenuIds: [24, 26, 29, 33, 35],
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
};

/**
 * Закреплённое подменю: стоит открытым рядом с полосой значков, пока человек сам его не
 * свернёт. Показан пункт активного адреса — его называет вход активности.
 */
export const SubMenuPinned: TStory = {
    args: {
        activeMenuIds: [1],
        subMenuMode: 'pinned',
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
};

/** Поиск с совпадениями: в подменю остаются пункты, подпись которых содержит запрос. */
export const SubMenuSearchMatches: TStory = {
    args: {
        activeMenuIds: [1],
        subMenuMode: 'pinned',
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await typeInSubMenuSearch(canvasElement, 'l');
    },
};

/** Совпадений нет: вместо списка стоит строка сообщения. */
export const SubMenuSearchEmpty: TStory = {
    args: {
        activeMenuIds: [1],
        subMenuMode: 'pinned',
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await typeInSubMenuSearch(canvasElement, 'no such item');
    },
};

/**
 * Незакреплённое подменю, открытое нажатием. Заведена ради переключателя: закреплённое помечено
 * залитой булавкой, а эта история — единственное место, где в кадре видно контурную. Без неё обе
 * моды показывались бы только закреплённой, и подмена значка не проверялась бы ничем.
 */
export const SubMenuHovered: TStory = {
    args: {
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openSubMenuByClick(canvasElement);
    },
};
