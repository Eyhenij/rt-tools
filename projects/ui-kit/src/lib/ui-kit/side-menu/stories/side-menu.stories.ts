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

/**
 * Какую долю панели пункт обязан занять. Не единица: у пункта свои отступы в списке, и равенства
 * числу здесь не бывает — а предел, отсчитанный от прежней ширины панели, оставляет справа
 * половину её ширины и в эту долю не укладывается ни при каких отступах.
 */
const FILL_SHARE: number = 0.85;

/** Ширина, во всю которую встаёт подменю на время работы с полем поиска: 30rem набора значений. */
const HELD_WIDTH: number = 480;

/** Панель подменю — то, чью ширину меряют все проверки ниже. */
const PANEL_SELECTOR: string = '.rtui-sub-side-menu-content';
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

/**
 * Проверка того, что пункт подменю не вылезает за панель, а длинная подпись обрезана.
 *
 * Ширину держит оформление, а стили компонента в спеке не применяются — там ширина панели равна
 * нулю. Поэтому утверждение живёт показом: он идёт настоящим браузером и меряет то же, что видит
 * человек.
 */
async function assertItemsFitPanel(canvasElement: HTMLElement): Promise<void> {
    const panel: HTMLElement | null = await waitFor<HTMLElement>((): HTMLElement | null => canvasElement.querySelector(PANEL_SELECTOR));

    if (panel === null) {
        throw new Error('Панель подменю не появилась: мерить нечего');
    }

    const panelBox: DOMRect = panel.getBoundingClientRect();
    const items: HTMLElement[] = [
        ...canvasElement.querySelectorAll<HTMLElement>('.rtui-side-menu-sub-item, .rtui-side-menu-expand-sub-item-header'),
    ];

    if (items.length === 0) {
        throw new Error('Пунктов в подменю нет: мерить нечего');
    }

    // Меряется правый край, а не ширина: вложенный пункт стоит с отступом уровня, и при ширине
    // в панель его край уезжает за неё ровно на этот отступ. Ширина такой пункт оправдывает, а
    // человек видит обрезанную строку под краем панели.
    const past: HTMLElement | undefined = items.find((item: HTMLElement): boolean => item.getBoundingClientRect().right > panelBox.right);

    if (past !== undefined) {
        const box: DOMRect = past.getBoundingClientRect();

        throw new Error(
            `Пункт уходит за панель: ${past.tagName}.${past.className} — правый край ${Math.round(box.right)} ` +
                `при крае панели ${Math.round(panelBox.right)}, ширина ${Math.round(box.width)}`
        );
    }
}

/** Обрезка подписи многоточием. Спрашивается там, где подписи заведомо длиннее панели. */
async function assertTitleClipped(canvasElement: HTMLElement): Promise<void> {
    const titles: HTMLElement[] = [...canvasElement.querySelectorAll<HTMLElement>('.rtui-side-menu-sub-item-title__text')];
    const clipped: HTMLElement | undefined = titles.find((title: HTMLElement): boolean => title.scrollWidth > title.clientWidth);

    if (clipped === undefined) {
        throw new Error('Ни одна подпись не обрезана: длинная подпись в этой истории должна уходить в многоточие');
    }
}

/**
 * Проверка того, что пункт занял ширину панели, а не встал уже неё.
 *
 * Мерится доля: у пункта свои отступы в списке, и равенства числу здесь не бывает. Полоса пустого
 * места справа шире отступов означает, что пункт считает предел от прежней ширины панели.
 */
async function assertItemsFillPanel(canvasElement: HTMLElement): Promise<void> {
    const panel: HTMLElement | null = await waitFor<HTMLElement>((): HTMLElement | null => canvasElement.querySelector(PANEL_SELECTOR));

    if (panel === null) {
        throw new Error('Панель подменю не появилась: мерить нечего');
    }

    const panelWidth: number = panel.getBoundingClientRect().width;
    // Меряется сама строка списка, а не хост компонента вокруг неё: хост тянется по месту всегда,
    // и проверка, взявшая его, зелена даже там, где строка внутри стоит прежней ширины.
    const items: HTMLElement[] = [...canvasElement.querySelectorAll<HTMLElement>('mat-list-item.rtui-side-menu-sub-item')];
    const widest: number = Math.max(...items.map((item: HTMLElement): number => item.getBoundingClientRect().width));

    if (widest < panelWidth * FILL_SHARE) {
        throw new Error(`Пункт уже панели: пункт ${Math.round(widest)} при панели ${Math.round(panelWidth)}`);
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

/**
 * SC-UK-40 — пункт подменю занимает ширину панели и не выходит за неё.
 *
 * Длинная подпись в узкой панели. Заведена ради предела ширины: пункт занимает ширину панели и
 * не шире её, а подпись, которая в неё не влезла, уходит в многоточие. Без этой истории вылезший
 * пункт виден только человеку, открывшему меню у потребителя: панель обрезает его по своему краю,
 * и кадр остаётся прежним.
 */
export const SubMenuLongTitle: TStory = {
    args: {
        activeMenuIds: [24, 26, 29, 33, 35],
        subMenuMode: 'pinned',
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await assertItemsFitPanel(canvasElement);
        await assertTitleClipped(canvasElement);
    },
};

/**
 * SC-UK-41 — подменю, удержанное полем поиска, тянет пункты за собой.
 *
 * Панель на время работы с полем встаёт во всю разрешённую ширину, и пункт обязан пойти за ней:
 * предел, отсчитанный от прежней ширины, оставил бы справа пустую полосу в половину панели.
 */
export const SubMenuHeldBySearch: TStory = {
    args: {
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openSubMenuByClick(canvasElement);

        const field: HTMLInputElement | null = await waitForField(canvasElement);

        if (field === null) {
            throw new Error('Поле поиска подменю не появилось: удерживать подменю нечем');
        }

        field.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

        // Сперва спрашивается сама панель: не выросшая, она делает обе проверки ниже
        // бессмысленными — пункт совпадает с прежней шириной и без всякой правки.
        const panel: HTMLElement | null = await waitFor<HTMLElement>((): HTMLElement | null => {
            const node: HTMLElement | null = canvasElement.querySelector(PANEL_SELECTOR);

            return node !== null && node.getBoundingClientRect().width >= HELD_WIDTH ? node : null;
        });

        if (panel === null) {
            const shown: HTMLElement | null = canvasElement.querySelector(PANEL_SELECTOR);

            throw new Error(
                `Панель не встала во всю ширину: ${Math.round(shown?.getBoundingClientRect().width ?? 0)} при ожидаемых ${HELD_WIDTH}`
            );
        }

        await assertItemsFitPanel(canvasElement);
        await assertItemsFillPanel(canvasElement);
    },
};
