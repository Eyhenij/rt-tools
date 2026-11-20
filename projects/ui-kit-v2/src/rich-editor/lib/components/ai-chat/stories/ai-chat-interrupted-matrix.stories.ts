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

/** Кольцо фокуса «спросить снова» целиком внутри ленты: ничто его не срезает. */
function expectRing(cell: HTMLElement): void {
    const button: HTMLElement = cell.querySelector<HTMLElement>(ASK) as HTMLElement;
    const feed: DOMRect = rectOf(cell, '[qa-dataid="ai-chat-feed"]');

    button.focus({ focusVisible: true });
    const shadow: string = getComputedStyle(button).boxShadow;
    const rect: DOMRect = button.getBoundingClientRect();

    button.blur();
    expectThat(shadow !== 'none', 'фокус с клавиши не рисует кольца');
    expectThat(rect.left - 3 >= feed.left && rect.top - 3 >= feed.top && rect.bottom + 3 <= feed.bottom, 'кольцо фокуса срезано лентой');
}

/**
 * Частичный ответ при 240, 328, 386 и 640: строка в одну строку, ряд действий в один ряд, лента не
 * раздвинута, кольцо фокуса при 240 целое — SC-UKV-1576.
 */
export const Widths: TStory = {
    args: { part: 'widths' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const cells: HTMLElement[] = await cellsOf(canvasElement, 4);

        cells.forEach(expectNumbers);
        expectRing(cells[0]);
    },
};

/** Пустой прерванный ответ: без строки хода, с ней, «не удался», с вложениями; в ряду одна кнопка. */
export const Empty: TStory = {
    args: { part: 'empty' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const cells: HTMLElement[] = await cellsOf(canvasElement, 4);

        for (const cell of cells) {
            expectNumbers(cell);
            expectThat(cell.querySelectorAll(`${ROW} > *`).length === 1, `${cell.dataset['answerWidth']}: в ряду не одна кнопка`);
        }
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
        const label: DOMRect = rectOf(node, LABEL);

        expectNumbers(cell);
        expectThat(near(label.right, answer.right), `справа налево: строка не у правого края, ${label.right} против ${answer.right}`);
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

/** Частичный и пустой ответ в светлой и тёмной теме: строка и кнопка под каждым ответом — SC-UKV-1580. */
export const Themes: TStory = {
    args: { part: 'themes' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const cells: HTMLElement[] = await cellsOf(canvasElement, 4);

        for (const cell of cells) {
            expectThat((cell.querySelector(LABEL)?.textContent ?? '').trim().length > 0, 'нет строки «прерван»');
            expectThat(cell.querySelector(ASK) !== null, 'нет кнопки «спросить снова»');
        }
    },
};
