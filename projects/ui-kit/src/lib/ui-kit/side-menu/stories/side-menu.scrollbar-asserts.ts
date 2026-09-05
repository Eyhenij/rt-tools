import { PANEL_SELECTOR, waitFor } from './side-menu.wait';

/** Предел ширины полосы прокрутки. Системная в этом браузере вдвое с лишним шире. */
const SLIM_SCROLLBAR_LIMIT: number = 8;

/** Правило полосы ищется по этой строке: селекторы псевдоэлементов лежат в тексте правила. */
const SCROLLBAR_RULE_MARK: string = '::-webkit-scrollbar';

/** Собственное свойство меню, которым задана ширина полосы. */
const SCROLLBAR_WIDTH_VAR: string = '--rt-side-menu-scrollbar-width';

/** Ищет во всех листах правило полосы, взявшее ширину из свойства меню. */
function scrollbarRuleFound(): boolean {
    const texts: string[] = [];

    for (const sheet of [...document.styleSheets]) {
        try {
            texts.push(...[...sheet.cssRules].map((rule: CSSRule): string => rule.cssText));
        } catch {
            texts.push('');
        }
    }

    return texts.some((text: string): boolean => text.includes(SCROLLBAR_RULE_MARK) && text.includes(SCROLLBAR_WIDTH_VAR));
}

/** Переводит значение свойства в пиксели: узел с этой шириной меряется, а не считается вручную. */
function widthInPixels(owner: HTMLElement, value: string): number {
    const probe: HTMLElement = document.createElement('div');

    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.width = value;
    owner.appendChild(probe);

    const width: number = probe.getBoundingClientRect().width;

    probe.remove();

    return width;
}

/**
 * SC-UK-47 — проверка того, что списки меню прокручиваются своей узкой полосой, а не системной.
 *
 * Спрашивается объявление, а не занятое полосой место: браузер прогона рисует полосы поверх
 * содержимого, и разность полной и внутренней ширины у него нулевая при любом оформлении. В
 * обычном браузере то же правило даёт полосе её ширину — замер этого лежит в записи задачи.
 */
export async function assertMenuScrollbarSlim(canvasElement: HTMLElement): Promise<void> {
    const body: HTMLElement | null = await waitFor<HTMLElement>((): HTMLElement | null =>
        canvasElement.querySelector('.rtui-side-menu .rtui-scrollable__content')
    );

    if (body === null) {
        throw new Error('Списка меню нет: спрашивать полосу не у чего');
    }

    if (!scrollbarRuleFound()) {
        throw new Error('Полоса прокрутки меню не оформлена: правила, берущего её ширину из свойства меню, в листах нет');
    }

    const declared: string = getComputedStyle(body).getPropertyValue(SCROLLBAR_WIDTH_VAR).trim();

    if (declared === '') {
        throw new Error('Ширина полосы у списка меню не объявлена: свойство пустое');
    }

    const width: number = widthInPixels(body, declared);

    if (width <= 0 || width > SLIM_SCROLLBAR_LIMIT) {
        throw new Error(`Полоса прокрутки меню не узкая: ${width} пикселей при пределе ${SLIM_SCROLLBAR_LIMIT}`);
    }

    const track: string = getComputedStyle(body).getPropertyValue('--rt-side-menu-scrollbar-track-color').trim();

    if (track === '') {
        throw new Error('Цвет дорожки полосы не объявлен: дорожка осталась бы прозрачной');
    }
}

/**
 * SC-UK-48 — проверка того, что список подменю не заходит в скруглённый угол панели.
 *
 * Панель обрезает всё, что в угол заходит, и полоса прокрутки по правому краю теряет там свой
 * конец: читается это обрубленной полосой. Геометрию видно и в браузере прогона — в отличие от
 * самой полосы, место которой он не показывает вовсе.
 */
export async function assertSubMenuClearsCorner(canvasElement: HTMLElement): Promise<void> {
    const panel: HTMLElement | null = await waitFor<HTMLElement>((): HTMLElement | null => canvasElement.querySelector(PANEL_SELECTOR));

    if (panel === null) {
        throw new Error('Панель подменю не появилась: угол мерить не у чего');
    }

    const body: HTMLElement | null = panel.querySelector('.rtui-scrollable__content');

    if (body === null) {
        throw new Error('Списка в панели подменю нет: мерить нечего');
    }

    const radius: number = parseFloat(getComputedStyle(panel).borderBottomRightRadius) || 0;

    if (radius === 0) {
        return;
    }

    const clearance: number = panel.getBoundingClientRect().bottom - body.getBoundingClientRect().bottom;

    if (clearance + 1 < radius) {
        throw new Error(`Список заходит в скруглённый угол панели: запас ${Math.round(clearance)} при радиусе ${Math.round(radius)}`);
    }
}
