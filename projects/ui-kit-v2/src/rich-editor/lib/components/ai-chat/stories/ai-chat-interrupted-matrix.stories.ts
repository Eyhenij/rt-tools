import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../../showcase/story-states';
import { TestRtAiChatInterruptedMatrixComponent } from './component/test-ai-chat-interrupted-matrix.component';

/**
 * Матрицы прерванного ответа — все случаи разом: тихая строка под ответом и «спросить снова» в
 * строке действий. Контролов нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего. Шаги `play` меряют раскладку по
 * `getBoundingClientRect`.
 */
export default {
    title: 'Organisms/Chat/AiChatInterrupted',
    component: TestRtAiChatInterruptedMatrixComponent,
    parameters: { controls: { disable: true } },
} as Meta<TestRtAiChatInterruptedMatrixComponent>;

type TStory = StoryObj<TestRtAiChatInterruptedMatrixComponent>;

const LABEL: string = '[qa-dataid="ai-chat-interrupted"]';
const ROW: string = '[qa-dataid="ai-chat-feedback"]';
const ASK: string = '[qa-dataid="ai-chat-ask-again"] button';
const COPY: string = '[qa-dataid="ai-chat-copy"] button';
const CELL: string = '[data-answer-width]';

/** Сколько ждать отрисовки, мс. */
const WAIT_MS: number = 5000;

interface IPlayContext {
    readonly canvasElement: HTMLElement;
}

function expectThat(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

/** Ждёт, пока условие не станет истинным, и отказывает словами, когда время вышло. */
async function until(condition: () => boolean, what: string, timeout: number = WAIT_MS): Promise<void> {
    await document.fonts.ready;
    const deadline: number = performance.now() + timeout;

    return new Promise<void>((resolve: () => void, reject: (reason: Error) => void): void => {
        const look: () => void = (): void => {
            if (condition()) {
                resolve();
            } else if (performance.now() > deadline) {
                reject(new Error(`не дождались: ${what}`));
            } else {
                requestAnimationFrame(look);
            }
        };
        look();
    });
}

function near(actual: number, expected: number): boolean {
    return Math.abs(actual - expected) <= 0.5;
}

function rectOf(scope: Element, selector: string): DOMRect {
    const node: Element | null = scope.querySelector(selector);

    if (node === null) {
        throw new Error(`нет узла ${selector}`);
    }

    return node.getBoundingClientRect();
}

/** Ячейки, когда в каждой из `count` встал ответ. */
async function cellsOf(root: HTMLElement, count: number): Promise<HTMLElement[]> {
    await until((): boolean => root.querySelectorAll(`${CELL} rt-ai-chat-answer`).length >= count, `ответов в ${count} ячейках`);

    return Array.from(root.querySelectorAll<HTMLElement>(CELL));
}

/**
 * Числа макета: строка 12 px с высотой 16, под ней в 8 строка действий 32 высотой, кнопки в один
 * ряд; ответ шириной ячейки, лента не раздвинута, ничто не выходит за ответ.
 */
function expectNumbers(cell: HTMLElement): void {
    const width: number = Number(cell.dataset['answerWidth']);
    const name: string = `${width}${cell.getAttribute('dir') === 'rtl' ? ' справа налево' : ''}`;
    const answer: HTMLElement = cell.querySelector<HTMLElement>('rt-ai-chat-answer') as HTMLElement;
    const edge: DOMRect = answer.getBoundingClientRect();
    const label: HTMLElement = answer.querySelector<HTMLElement>(LABEL) as HTMLElement;
    const row: DOMRect = rectOf(answer, ROW);
    const text: DOMRect = label.getBoundingClientRect();
    const feed: HTMLElement = cell.querySelector<HTMLElement>('[qa-dataid="ai-chat-feed"]') as HTMLElement;

    expectThat(near(edge.width, width), `${name}: ответ ${edge.width}, а не ${width}`);
    expectThat(getComputedStyle(label).fontSize === '12px', `${name}: строка ${getComputedStyle(label).fontSize}, а не 12px`);
    expectThat(text.height < 17, `${name}: строка ${text.height} высотой — не в одну строку`);
    expectThat(near(row.top - text.bottom, 8), `${name}: от строки до ряда ${row.top - text.bottom}, а не 8`);
    expectThat(near(row.height, 32), `${name}: ряд действий ${row.height}, а не 32`);
    expectThat(text.left >= edge.left - 0.5 && text.right <= edge.right + 0.5, `${name}: строка за краем ответа`);
    expectThat(row.left >= edge.left - 0.5 && row.right <= edge.right + 0.5, `${name}: ряд за краем ответа`);
    expectThat(feed.scrollWidth <= feed.clientWidth + 1, `${name}: лента раздвинута ${feed.scrollWidth} > ${feed.clientWidth}`);
}

/** Толщина кольца фокуса кита, px. */
const RING_PX: number = 3;

/** Сколько ждать, пока кнопка доиграет переход тени, мс: у неё переход 0.12 с. */
const RING_SETTLE_MS: number = 300;

/** Последний слой тени: его разброс и цвет — это кольцо. */
function ringOf(shadow: string): { readonly spread: number; readonly visible: boolean } {
    const cut: number = shadow.lastIndexOf('px, ');
    const layer: string = (cut < 0 ? shadow : shadow.slice(cut + 'px, '.length)).trim();
    const spread: number = Number((layer.split(' ').at(-1) ?? '').replace('px', ''));
    const transparent: boolean = layer.includes('/ 0)') || layer.startsWith('rgba(0, 0, 0, 0)');

    return { spread, visible: shadow !== 'none' && !transparent };
}

/**
 * Кольцо фокуса «спросить снова» дорисовано и целиком внутри каждого предка, который режет
 * содержимое: ленты, чата и ящика ячейки — со всех четырёх сторон.
 */
async function expectRing(cell: HTMLElement): Promise<void> {
    const button: HTMLElement = cell.querySelector<HTMLElement>(ASK) as HTMLElement;
    const name: string = cell.dataset['answerWidth'] ?? '';

    // Без прокрутки: фокус на нижней ячейке сдвинул бы страницу, и кадр снялся бы со срезанным верхом
    button.focus({ focusVisible: true, preventScroll: true });
    await new Promise<void>((resolve: () => void): void => {
        setTimeout(resolve, RING_SETTLE_MS);
    });
    const ring: { readonly spread: number; readonly visible: boolean } = ringOf(getComputedStyle(button).boxShadow);
    const rect: DOMRect = button.getBoundingClientRect();

    button.blur();
    expectThat(ring.visible && near(ring.spread, RING_PX), `${name}: фокус с клавиши не рисует кольца в ${RING_PX} px`);

    for (let node: HTMLElement | null = button.parentElement; node !== null && node !== cell.parentElement; node = node.parentElement) {
        if (getComputedStyle(node).overflow === 'visible') {
            continue;
        }
        const edge: DOMRect = node.getBoundingClientRect();
        const inside: boolean =
            rect.left - RING_PX >= edge.left - 0.5 &&
            rect.right + RING_PX <= edge.right + 0.5 &&
            rect.top - RING_PX >= edge.top - 0.5 &&
            rect.bottom + RING_PX <= edge.bottom + 0.5;

        expectThat(inside, `${name}: кольцо фокуса срезано узлом ${node.className}`);
    }
}

/** Правый край текста строки, а не её блока: блок всегда во всю ширину ответа. */
function textRightOf(label: Element): number {
    const range: Range = document.createRange();

    range.selectNodeContents(label);

    return range.getBoundingClientRect().right;
}

/** Яркость цвета по WCAG; полупрозрачный цвет сначала накладывается на подложку. */
function luminanceOf(color: string, under: readonly number[] = [255, 255, 255]): number {
    const parts: number[] = (color.match(/[\d.]+/g) ?? []).map(Number);
    const alpha: number = parts[3] ?? 1;
    const channel: (value: number, index: number) => number = (value: number, index: number): number => {
        const mixed: number = (value * alpha + under[index] * (1 - alpha)) / 255;

        return mixed <= 0.03928 ? mixed / 12.92 : ((mixed + 0.055) / 1.055) ** 2.4;
    };
    const [r, g, b]: number[] = parts.slice(0, 3).map(channel);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Контраст строки с подложкой чата. */
function contrastOf(cell: HTMLElement): number {
    const ground: string = getComputedStyle(cell.querySelector('rt-ai-chat') as Element).backgroundColor;
    const under: number[] = (ground.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const text: number = luminanceOf(getComputedStyle(cell.querySelector(LABEL) as Element).color, under);
    const back: number = luminanceOf(ground);

    return (Math.max(text, back) + 0.05) / (Math.min(text, back) + 0.05);
}

/**
 * Частичный ответ при 240, 328, 386 и 640, русскими и английскими подписями: строка в одну строку,
 * ряд действий в один ряд, лента не раздвинута, кольцо фокуса при 240 целое — SC-UKV-1576.
 */
export const Widths: TStory = {
    args: { part: 'widths' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const cells: HTMLElement[] = await cellsOf(canvasElement, 8);

        cells.forEach(expectNumbers);
        for (const cell of cells.slice(4)) {
            expectThat((cell.querySelector(LABEL)?.textContent ?? '').trim() === 'Answer interrupted', 'английская строка не та');
        }
        await expectRing(cells[0]);
        await expectRing(cells[4]);
    },
};

/**
 * Пустой прерванный ответ: без строки хода при 240 и 328, с ней, «не удался», с вложениями; в ряду
 * одна кнопка, и при 240 её кольцо у самого края ряда целое.
 */
export const Empty: TStory = {
    args: { part: 'empty' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const cells: HTMLElement[] = await cellsOf(canvasElement, 5);

        for (const cell of cells) {
            expectNumbers(cell);
            expectThat(cell.querySelectorAll(`${ROW} > *`).length === 1, `${cell.dataset['answerWidth']}: в ряду не одна кнопка`);
        }
        await expectRing(cells[0]);
    },
};

/** С ошибкой хода, английские подписи и пишущийся ответ без строки и кнопки. */
export const Cases: TStory = {
    args: { part: 'cases' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const cells: HTMLElement[] = await cellsOf(canvasElement, 3);

        expectNumbers(cells[0]);
        expectNumbers(cells[1]);
        expectThat((cells[1].querySelector(LABEL)?.textContent ?? '').trim() === 'Answer interrupted', 'английская строка не та');
        expectThat(cells[1].querySelector(ASK)?.getAttribute('aria-label') === 'Ask again', 'английская кнопка не та');
        expectThat(cells[2].querySelector(LABEL) === null && cells[2].querySelector(ASK) === null, 'пишущийся ответ рисует строку');
    },
};

/** Под `dir="rtl"`: строка у правого края, «копировать» справа, «спросить снова» левее — SC-UKV-1577. */
export const Rtl: TStory = {
    args: { part: 'rtl' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const cell: HTMLElement = (await cellsOf(canvasElement, 1))[0];
        // «Копировать» есть и у вопроса: ищется только в ответе
        const node: Element = cell.querySelector('rt-ai-chat-answer') as Element;
        const answer: DOMRect = node.getBoundingClientRect();
        const right: number = textRightOf(node.querySelector(LABEL) as Element);

        expectNumbers(cell);
        expectThat(near(right, answer.right), `справа налево: текст строки не у правого края, ${right} против ${answer.right}`);
        expectThat(rectOf(node, COPY).left >= rectOf(node, ASK).right, 'справа налево: «копировать» не правее «спросить снова»');
    },
};

/** «Спросить снова»: обычное, наведение, фокус с клавиши, отключено на время отправки. */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('[qa-dataid="ai-chat-ask-again"] .rt-icon-button') },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const cells: HTMLElement[] = await cellsOf(canvasElement, 4);

        cells.forEach(expectNumbers);
        expectThat((cells[3].querySelector(ASK) as HTMLButtonElement).disabled, 'на время отправки кнопка не отключена');
    },
};

/** Частичный и пустой ответ в обоих наборах оформления. */
export const Presets: TStory = { args: { part: 'presets' } };

/** Наименьший контраст строки с подложкой: приглушённый текст по WCAG AA. */
const LABEL_CONTRAST: number = 4.5;

/**
 * Частичный и пустой ответ в светлой и тёмной теме: строка и кнопка под каждым ответом, строка в
 * тёмной палитре своим цветом и читается на подложке, иконка светлее, чем в светлой теме — SC-UKV-1580.
 */
export const Themes: TStory = {
    args: { part: 'themes' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const cells: HTMLElement[] = await cellsOf(canvasElement, 4);
        const iconOf: (cell: HTMLElement) => string = (cell: HTMLElement): string =>
            getComputedStyle(cell.querySelector(`${ASK} rt-icon`) as Element).color;
        const labelOf: (cell: HTMLElement) => string = (cell: HTMLElement): string =>
            getComputedStyle(cell.querySelector(LABEL) as Element).color;

        for (const cell of cells) {
            const theme: string = cell.closest('[data-theme]')?.getAttribute('data-theme') ?? 'light';

            expectThat((cell.querySelector(LABEL)?.textContent ?? '').trim().length > 0, `${theme}: нет строки «прерван»`);
            expectThat(cell.querySelector(ASK) !== null, `${theme}: нет кнопки «спросить снова»`);
            expectThat(contrastOf(cell) >= LABEL_CONTRAST, `${theme}: контраст строки ${contrastOf(cell).toFixed(2)}`);
        }
        expectThat(labelOf(cells[0]) !== labelOf(cells[2]), 'тёмная строка того же цвета, что светлая');
        expectThat(iconOf(cells[0]) !== iconOf(cells[2]), 'тёмная иконка того же цвета, что светлая');
    },
};
