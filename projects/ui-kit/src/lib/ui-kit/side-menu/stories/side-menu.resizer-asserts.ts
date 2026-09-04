import { PANEL_SELECTOR, waitFor } from './side-menu.wait';

/** Ручка тяги: узел, которым панель подменю раздвигают за край. */
const RESIZER_SELECTOR: string = '.rtui-side-menu-resizer';

/** Собственные свойства меню: видимая полоса и зона, которой ручка захватывается курсором. */
const LINE_WIDTH_VAR: string = '--rt-side-menu-resizer-width';
const GRAB_WIDTH_VAR: string = '--rt-side-menu-resizer-grab-width';

/**
 * Во сколько раз зона захвата обязана быть шире видимой полосы. Не «шире вообще»: лишний пиксель
 * прошёл бы проверку и ничего не изменил для того, кто целится курсором.
 */
const GRAB_RATIO: number = 2;

/** Допуск в пикселях: дробные ширины браузер округляет по-своему. */
const TOLERANCE: number = 1;

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

/** Значение своего свойства меню, объявленное на ручке. Пустое — правка до узла не дошла. */
function declaredWidth(resizer: HTMLElement, name: string): string {
    const declared: string = getComputedStyle(resizer).getPropertyValue(name).trim();

    if (declared === '') {
        throw new Error(`Свойство ${name} у ручки тяги не объявлено: мерить нечего`);
    }

    return declared;
}

/**
 * SC-UK-49 — проверка того, что ручка тяги захватывается курсором шире, чем видна.
 *
 * Меряются три вещи: ширина самого узла — это и есть мишень для курсора; ширина видимой полосы —
 * она должна остаться прежней; место правого края полосы — он стоит на краю панели, как и до
 * правки. Без третьего замера проверку прошла бы и ручка, съехавшая вбок вместе со своей зоной.
 */
export async function assertResizerGrabWiderThanLine(canvasElement: HTMLElement): Promise<void> {
    const resizer: HTMLElement | null = await waitFor<HTMLElement>((): HTMLElement | null => canvasElement.querySelector(RESIZER_SELECTOR));

    if (resizer === null) {
        throw new Error('Ручки тяги нет: мерить нечего');
    }

    const line: number = widthInPixels(resizer, declaredWidth(resizer, LINE_WIDTH_VAR));
    const grab: number = resizer.getBoundingClientRect().width;
    const declaredGrab: number = widthInPixels(resizer, declaredWidth(resizer, GRAB_WIDTH_VAR));

    if (Math.abs(grab - declaredGrab) > TOLERANCE) {
        throw new Error(`Узел ручки шире или уже объявленной зоны захвата: ${grab} при объявленных ${declaredGrab}`);
    }

    if (grab < line * GRAB_RATIO) {
        throw new Error(`Зона захвата ручки не шире видимой полосы: ${grab} против ${line} пикселей`);
    }

    const panel: HTMLElement | null = canvasElement.querySelector(PANEL_SELECTOR);

    if (panel === null) {
        throw new Error('Панели подменю нет: край, у которого стоит ручка, мерить не у чего');
    }

    // Правый край видимой полосы: узел сдвинут влево на свес, и полоса внутри него отступает на
    // ту же величину — значит её край стоит там же, где стоял до расширения зоны.
    const overhang: number = (grab - line) / 2;
    const lineRight: number = resizer.getBoundingClientRect().left + overhang + line;
    const panelRight: number = panel.getBoundingClientRect().right;

    if (Math.abs(lineRight - panelRight) > TOLERANCE) {
        throw new Error(`Видимая полоса ручки съехала с края панели: полоса ${Math.round(lineRight)}, панель ${Math.round(panelRight)}`);
    }
}
