import { PANEL_SELECTOR, waitFor } from './side-menu.wait';

/** Контейнер шторки: тот узел, чью прокрутку и меряет проверка. */
const CONTAINER_SELECTOR: string = '.rtui-sub-side-menu';

/** Пункт подменю: с него зовут подведение в видимую часть, которым панель и уезжала. */
const SUB_ITEM_SELECTOR: string = '.rtui-sub-side-menu-content .mat-mdc-list-item';

/** Допуск в пикселях: дробные высоты браузер округляет по-своему. */
const TOLERANCE: number = 1;

/**
 * SC-UK-60 — проверка того, что панель подменю остаётся на месте.
 *
 * Меряются две вещи. Первая — контейнер шторки не прокручиваем: высота его содержимого не выше
 * его собственной. Прокручиваемым он становится, когда шторка возвращается в поток и встаёт над
 * содержимым контейнера, и тогда его высота удваивается. Вторая — верх панели совпадает с верхом
 * контейнера после того, как активный пункт подведён в видимую часть: подведение зовут на каждой
 * смене раздела, и уезжала панель именно от него.
 */
export async function assertSubMenuKeepsItsPlace(canvasElement: HTMLElement): Promise<void> {
    const container: HTMLElement | null = await waitFor<HTMLElement>((): HTMLElement | null =>
        canvasElement.querySelector(CONTAINER_SELECTOR)
    );

    if (container === null) {
        throw new Error('Контейнера шторки нет: мерить прокрутку не у чего');
    }

    const panel: HTMLElement | null = canvasElement.querySelector(PANEL_SELECTOR);

    if (panel === null) {
        throw new Error('Панели подменю нет: мерить её место не у чего');
    }

    if (container.scrollHeight > container.clientHeight + TOLERANCE) {
        throw new Error(`Контейнер шторки прокручиваем: содержимое ${container.scrollHeight} при высоте ${container.clientHeight}`);
    }

    const item: HTMLElement | null = canvasElement.querySelector(SUB_ITEM_SELECTOR);

    if (item === null) {
        throw new Error('Пункта подменю нет: подводить в видимую часть нечего');
    }

    const before: number = panel.getBoundingClientRect().top;

    item.scrollIntoView({ block: 'start' });

    const after: number = panel.getBoundingClientRect().top;

    if (Math.abs(after - before) > TOLERANCE) {
        throw new Error(`Панель уехала от подведения пункта: было ${Math.round(before)}, стало ${Math.round(after)}`);
    }

    if (container.scrollTop > TOLERANCE) {
        throw new Error(`Подведение пункта прокрутило контейнер шторки на ${container.scrollTop} пикселей`);
    }
}
