/**
 * Шаги историй бокового меню: доводят живое меню до состояния тем же путём, что и человек, — нажатием
 * раздела, набором запроса, клавишей. Ждётся сам узел, а не отсчёт времени: на занятой машине отсчёт
 * промахивается, и кадр уходит без состояния. Не дождавшись, шаг отказывает словами, а не пускает
 * кадр пустым.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */

/** Узел панели подменю: его обещают показать истории, открывающие подменю наведением. */
export const SIDE_MENU_PANEL: string = '[qa-dataid="side-menu-panel"]';

const WAIT_FRAMES: number = 120;

async function waitFor<T extends Element>(find: () => T | null): Promise<T | null> {
    for (let frame: number = 0; frame < WAIT_FRAMES; frame++) {
        const node: T | null = find();

        if (node !== null) {
            return node;
        }

        await new Promise<void>((resolve: () => void): number => requestAnimationFrame((): void => resolve()));
    }

    return null;
}

async function field(canvas: HTMLElement): Promise<HTMLInputElement> {
    const input: HTMLInputElement | null = await waitFor<HTMLInputElement>((): HTMLInputElement | null =>
        canvas.querySelector('[qa-dataid="side-menu-search"] input')
    );

    if (input === null) {
        throw new Error('Поле поиска подменю не появилось: набирать запрос некуда, и кадр был бы пустым');
    }

    return input;
}

/** Открывает раздел нажатием его пункта на полосе — первый раздел с подменю, если имя не названо. */
export async function openSection(canvas: HTMLElement, name: string = 'Content'): Promise<void> {
    const item: HTMLElement | null = await waitFor<HTMLElement>(
        (): HTMLElement | null =>
            Array.from(canvas.querySelectorAll<HTMLElement>('[qa-dataid="side-menu-item"]')).find(
                (node: HTMLElement): boolean => node.textContent?.trim() === name
            ) ?? null
    );

    if (item === null) {
        throw new Error(`Пункта «${name}» на полосе нет: открывать нечего`);
    }

    item.click();

    if ((await waitFor<HTMLElement>((): HTMLElement | null => canvas.querySelector(SIDE_MENU_PANEL))) === null) {
        throw new Error(`Раздел «${name}» нажат, а панель подменю не открылась`);
    }
}

/** Набирает запрос в поле поиска подменю. */
export async function typeQuery(canvas: HTMLElement, query: string): Promise<void> {
    const input: HTMLInputElement = await field(canvas);

    input.value = query;
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

/** Нажимает клавишу в поле поиска: поле держит фокус и раздаёт клавиши списку. */
export async function pressKey(canvas: HTMLElement, key: string): Promise<void> {
    const input: HTMLInputElement = await field(canvas);

    input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

    if ((await waitFor<HTMLElement>((): HTMLElement | null => canvas.querySelector('.rt-side-menu-sub-item__row--highlighted'))) === null) {
        throw new Error('Подсвеченной строки нет: кадр показал бы список без отметки');
    }
}

/** Ставит фокус в поле поиска: подменю, взятое полем, встаёт во всю ширину. */
export async function holdBySearch(canvas: HTMLElement): Promise<void> {
    const input: HTMLInputElement = await field(canvas);

    input.focus();

    if (
        (await waitFor<HTMLElement>((): HTMLElement | null => canvas.querySelector(`${SIDE_MENU_PANEL}.rt-side-menu__panel--held`))) ===
        null
    ) {
        throw new Error('Фокус в поле поиска, а панель не встала удержанной');
    }
}
