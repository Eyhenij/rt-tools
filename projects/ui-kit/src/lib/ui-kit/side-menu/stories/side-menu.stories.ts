import { Meta, StoryObj } from '@storybook/angular';

import { TestSideMenuWrapperComponent } from './component/test-side-menu-wrapper.component';
import { assertResizerGrabWiderThanLine } from './side-menu.resizer-asserts';
import { assertMenuScrollbarSlim, assertSubMenuClearsCorner } from './side-menu.scrollbar-asserts';
import { PANEL_SELECTOR, waitFor } from './side-menu.wait';

export default {
    title: 'Components/SideMenu',
    component: TestSideMenuWrapperComponent,
} as Meta<TestSideMenuWrapperComponent>;

type TStory = StoryObj<TestSideMenuWrapperComponent>;

/**
 * Какую долю панели пункт обязан занять. Не единица: у пункта свои отступы в списке, и равенства
 * числу здесь не бывает — а предел, отсчитанный от прежней ширины панели, оставляет справа
 * половину её ширины и в эту долю не укладывается ни при каких отступах.
 */
const FILL_SHARE: number = 0.85;

/** Ширина, во всю которую встаёт подменю на время работы с полем поиска: 30rem набора значений. */
const HELD_WIDTH: number = 480;

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

/** Полоса растушёвки над нижним краем списка — то, чей цвет спрашивает проверка схемы. */
const HINT_SELECTOR: string = '[qa-dataid="scrollable-scroll-hint"]';

/**
 * Ряды роли, которыми цветовая схема перекрашивает акцентный слой. Ровно то, что кладёт на
 * страницу блок `[data-rt-scheme]`: своей объявленной схемы у витрины нет, а проверке нужна не
 * схема с именем, а её приём.
 */
const SCHEME_PROBE: Readonly<Record<string, string>> = {
    '--rt-color-primary-20': '#b3e3e1',
    '--rt-color-primary-40': '#5cb8b5',
    '--rt-color-primary-60': '#1a9d99',
    '--rt-color-primary-100': '#008582',
};

/**
 * SC-UK-45 — проверка того, что растушёвка идёт за выбранной цветовой схемой и за темой.
 *
 * Цвет собирается из токенов, а токены разрешает браузер: в спеке `var()` остаётся строкой, и
 * взятая там растушёвка совпадает сама с собой при любой схеме. Поэтому спрашивается здесь —
 * вычисленным значением, снятым до и после перекраски.
 *
 * Схема и тема ставятся на корень страницы и снимаются в конце: снимок истории идёт после
 * показа, и оставленная схема увела бы эталон вслед за проверкой.
 */
async function assertHintFollowsScheme(canvasElement: HTMLElement): Promise<void> {
    const hint: HTMLElement | null = await waitFor<HTMLElement>((): HTMLElement | null => canvasElement.querySelector(HINT_SELECTOR));

    if (hint === null) {
        throw new Error('Признака непоказанного снизу нет: красить нечего');
    }

    const root: HTMLElement = document.documentElement;
    const read: () => string = (): string => getComputedStyle(hint).backgroundImage;

    try {
        const plain: string = read();

        Object.entries(SCHEME_PROBE).forEach(([name, value]: [string, string]): void => root.style.setProperty(name, value));

        const scheme: string = read();

        if (scheme === plain) {
            throw new Error(`Растушёвка не пошла за схемой: цвет остался прежним — ${plain}`);
        }

        root.classList.add('rt-dark');

        const dark: string = read();

        if (dark === scheme) {
            throw new Error(`Растушёвка не различает тёмную тему при той же схеме: ${dark}`);
        }
    } finally {
        Object.keys(SCHEME_PROBE).forEach((name: string): void => {
            root.style.removeProperty(name);
        });
        root.classList.remove('rt-dark');
    }
}

/**
 * SC-UK-46 — проверка того, что растушёвка доходит до содержимого подвала, а не обрывается у края
 * списка.
 *
 * Между низом списка и первой строкой подвала стоит верхний отступ подвала — его задаёт
 * потребитель, и разделительную линию он рисует уже за ним. Полоса, кончающаяся у края списка,
 * оставляет между собой и линией чистый фон, и стык читается кривой вёрсткой.
 */
async function assertHintReachesFooter(canvasElement: HTMLElement): Promise<void> {
    const hint: HTMLElement | null = await waitFor<HTMLElement>((): HTMLElement | null => canvasElement.querySelector(HINT_SELECTOR));

    if (hint === null) {
        throw new Error('Признака непоказанного снизу нет: мерить нечего');
    }

    const footer: HTMLElement | null = canvasElement.querySelector('.rtui-scrollable__footer');

    if (footer === null) {
        throw new Error('Подвала области нет: стыка, о котором проверка, не существует');
    }

    const footerBox: DOMRect = footer.getBoundingClientRect();
    const contentTop: number = footerBox.top + parseFloat(getComputedStyle(footer).paddingTop);
    const gap: number = contentTop - hint.getBoundingClientRect().bottom;

    if (Math.abs(gap) > 1) {
        throw new Error(`Между растушёвкой и содержимым подвала полоса чистого фона: ${Math.round(gap)} пикселей`);
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

/**
 * SC-UK-43 — список, который не влез по высоте, говорит об этом.
 *
 * Окно кадра нарочно низкое: в полный рост полоса значков влезает целиком, и признаку неоткуда
 * взяться. Прокрутка до конца его снимает — иначе он висел бы поверх последнего пункта.
 */
export const MenuScrollHint: TStory = {
    // Кадру нужен низкий экран: в полный рост полоса значков влезает целиком, и признаку
    // непоказанного снизу взяться неоткуда. Размер кадра задаёт история — глобальная рамка
    // витрины на съёмку не влияет вовсе.
    parameters: { snapshotViewport: { width: 1280, height: 360 } },
    args: {
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await assertHintFollowsScheme(canvasElement);
        await assertHintReachesFooter(canvasElement);
    },
};

/**
 * SC-UK-47 — списки меню прокручиваются узкой полосой.
 *
 * Окно кадра нарочно низкое: в полный рост списки влезают целиком, и полосы у них не бывает вовсе.
 * Подменю здесь закреплено и раскрыто до третьего уровня: полоса нужна обоим спискам сразу.
 */
/**
 * SC-UK-49 — ручка тяги ловится курсором шире, чем видна.
 *
 * Подменю закреплено: у незакреплённого ручки нет вовсе — тянуть нечего, пока панель не открыта.
 */
export const MenuResizerGrab: TStory = {
    parameters: { snapshotViewport: { width: 1280, height: 360 } },
    args: {
        subMenuMode: 'pinned',
        activeMenuIds: [24],
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await assertResizerGrabWiderThanLine(canvasElement);
    },
};

export const MenuScrollbar: TStory = {
    parameters: { snapshotViewport: { width: 1280, height: 360 } },
    args: {
        subMenuMode: 'pinned',
        activeMenuIds: [24, 26, 29, 33, 35],
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await assertMenuScrollbarSlim(canvasElement);
        await assertSubMenuClearsCorner(canvasElement);
    },
};
