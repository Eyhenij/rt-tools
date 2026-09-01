import { Meta, StoryObj } from '@storybook/angular';

import { TestSideMenuWrapperComponent } from './component/test-side-menu-wrapper.component';

export default {
    title: 'Components/SideMenu',
    component: TestSideMenuWrapperComponent,
} as Meta<TestSideMenuWrapperComponent>;

type TStory = StoryObj<TestSideMenuWrapperComponent>;

/**
 * Предел ожидания в миллисекундах, а не в кадрах анимации.
 *
 * Кадрами ожидание меряться не может: под нагрузкой браузер отдаёт их реже, и полсотни кадров
 * укладываются в доли секунды реального времени — показ падает там, где приложение просто не
 * успело нарисовать. Ловилось это на занятой машине, где рядом шли прогон и сборка.
 */
const WAIT_LIMIT_MS: number = 5000;
const WAIT_STEP_MS: number = 50;

/** Ожидание того, что вернёт узел: по часам, шагом, до предела. */
async function waitFor<T>(find: () => T | null): Promise<T | null> {
    const until: number = Date.now() + WAIT_LIMIT_MS;

    for (;;) {
        const found: T | null = find();

        if (found !== null) {
            return found;
        }

        if (Date.now() >= until) {
            return null;
        }

        await new Promise<void>((resolve: () => void): void => {
            setTimeout(resolve, WAIT_STEP_MS);
        });
    }
}

async function waitForField(canvasElement: HTMLElement): Promise<HTMLInputElement | null> {
    return waitFor<HTMLInputElement>((): HTMLInputElement | null => canvasElement.querySelector('[qa-dataid="side-menu-search"]'));
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
async function openSubMenuByClick(canvasElement: HTMLElement): Promise<void> {
    const item: HTMLElement | null = await waitFor<HTMLElement>((): HTMLElement | null =>
        canvasElement.querySelector('a.rtui-side-menu-item')
    );

    if (item === null) {
        throw new Error('Пункт меню не появился: нажимать нечего');
    }

    item.click();

    const head: HTMLElement | null = await waitFor<HTMLElement>((): HTMLElement | null => {
        const node: HTMLElement | null = canvasElement.querySelector('.rtui-sub-side-menu-head');

        return node !== null && node.getBoundingClientRect().x >= 0 ? node : null;
    });

    if (head === null) {
        throw new Error('Подменю не открылось: кадр показал бы закрытый ящик вместо переключателя');
    }
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
 * Растянутое подменю: ширину человек тянет за правый край панели, и хранит её потребитель — так
 * же, как моду. Здесь она задана доводом истории, иначе кадр показывал бы ширину из набора
 * токенов и о тяге не говорил бы ничего.
 */
export const SubMenuWide: TStory = {
    args: {
        activeMenuIds: [1],
        subMenuMode: 'pinned',
        subMenuWidth: 360,
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
};

/**
 * Незакреплённое подменю, открытое нажатием. Заведена ради переключателя: у закреплённого значок
 * кнопки окрашен цветом бренда, а эта история — единственное место, где в кадре видно спокойный.
 * Без неё обе моды показывались бы только закреплённой, и смена цвета не проверялась бы ничем.
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
