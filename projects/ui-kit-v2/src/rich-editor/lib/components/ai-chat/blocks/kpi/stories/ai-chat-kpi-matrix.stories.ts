import { Meta, StoryObj } from '@storybook/angular';

import { TestRtAiChatKpiMatrixComponent } from './component/test-ai-chat-kpi-matrix.component';

/**
 * Матрицы блока KPI — все случаи разом. Контролов нет намеренно: состояние, до которого надо
 * доехать переключателем, при беглом просмотре неотличимо от отсутствующего. Шаги `play` меряют
 * раскладку: число колонок, ширину карточек, общий верх ряда, текст в пределах карточки.
 */
export default {
    title: 'Organisms/Chat/AiChatKpi',
    component: TestRtAiChatKpiMatrixComponent,
    parameters: { controls: { disable: true } },
} as Meta<TestRtAiChatKpiMatrixComponent>;

type TStory = StoryObj<TestRtAiChatKpiMatrixComponent>;

/** Хост блока: в историях чата блок один, его и меряют. */
const BLOCK: string = 'rt-ai-chat-kpi';

/** Карточка блока. */
const CARD: string = '[qa-dataid="ai-chat-kpi-card"]';
const VALUE: string = '[qa-dataid="stat-tile-value"]';

interface IPlayContext {
    readonly canvasElement: HTMLElement;
}

/** Раскладка одного блока: колонки первого ряда, ширины карточек и верхи по рядам. */
interface ILayout {
    readonly columns: number;
    readonly widths: readonly number[];
    readonly rows: readonly (readonly number[])[];
}

/** Ждёт, пока в истории встанет столько узлов по выбору, и отдаёт их. */
async function settledAll(root: HTMLElement, selector: string, count: number = 1): Promise<HTMLElement[]> {
    await document.fonts.ready;

    return new Promise<HTMLElement[]>((resolve: (nodes: HTMLElement[]) => void): void => {
        const look: () => void = (): void => {
            const nodes: HTMLElement[] = Array.from(root.querySelectorAll<HTMLElement>(selector));

            if (nodes.length < count) {
                requestAnimationFrame(look);
            } else {
                resolve(nodes);
            }
        };
        look();
    });
}

/** Первый блок истории, когда он встал. */
async function firstBlock(root: HTMLElement): Promise<HTMLElement> {
    const blocks: HTMLElement[] = await settledAll(root, BLOCK);

    return blocks[0];
}

function expectThat(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

function layoutOf(block: HTMLElement): ILayout {
    const cards: DOMRect[] = Array.from(block.querySelectorAll<HTMLElement>(CARD)).map((card: HTMLElement): DOMRect =>
        card.getBoundingClientRect()
    );
    const tops: number[] = [...new Set(cards.map((rect: DOMRect): number => Math.round(rect.top)))];

    return {
        columns: cards.filter((rect: DOMRect): boolean => Math.round(rect.top) === tops[0]).length,
        widths: cards.map((rect: DOMRect): number => Math.round(rect.width)),
        rows: tops.map((top: number): number[] =>
            cards.filter((rect: DOMRect): boolean => Math.round(rect.top) === top).map((rect: DOMRect): number => Math.round(rect.height))
        ),
    };
}

/** Каждый ряд — карточки одной высоты (SC-UKV-1464), ширины карточек одинаковы (SC-UKV-1460). */
function expectRows(layout: ILayout, name: string): void {
    for (const row of layout.rows) {
        expectThat(new Set(row).size === 1, `${name}: карточки ряда разной высоты ${row.join(', ')}`);
    }
    expectThat(new Set(layout.widths).size === 1, `${name}: карточки разной ширины ${layout.widths.join(', ')}`);
}

/** Прямоугольники строк каждого текстового узла: меряется сам текст, а не коробка вокруг него. */
function textRects(card: HTMLElement): { readonly text: string; readonly rect: DOMRect }[] {
    const walker: TreeWalker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
    const range: Range = document.createRange();
    const rects: { readonly text: string; readonly rect: DOMRect }[] = [];

    for (let node: Node | null = walker.nextNode(); node !== null; node = walker.nextNode()) {
        const text: string = node.textContent?.trim() ?? '';

        if (text !== '') {
            range.selectNodeContents(node);
            rects.push(...Array.from(range.getClientRects()).map((rect: DOMRect): { text: string; rect: DOMRect } => ({ text, rect })));
        }
    }

    return rects;
}

/** Левый край первого вхождения `glyph` в значении карточки: так видно, в каком порядке стоят части. */
function leftOf(card: HTMLElement, glyph: string): number {
    const node: Node | null | undefined = card.querySelector(VALUE)?.querySelector('bdi')?.firstChild;
    const at: number = node?.textContent?.indexOf(glyph) ?? -1;

    if (node === null || node === undefined || at < 0) {
        return Number.NaN;
    }
    const range: Range = document.createRange();

    range.setStart(node, at);
    range.setEnd(node, at + glyph.length);

    return range.getBoundingClientRect().left;
}

/** Число значения стоит на одной строке: перенос бывает только у единицы (SC-UKV-1484). */
function expectWholeNumbers(block: HTMLElement, name: string): void {
    const range: Range = document.createRange();

    for (const value of Array.from(block.querySelectorAll<HTMLElement>(VALUE))) {
        const walker: TreeWalker = document.createTreeWalker(value, NodeFilter.SHOW_TEXT);

        for (let node: Node | null = walker.nextNode(); node !== null; node = walker.nextNode()) {
            const found: RegExpExecArray | null = /\p{Nd}(?:[\p{Nd},.\s]*\p{Nd})?/u.exec(node.textContent ?? '');

            if (found !== null) {
                range.setStart(node, found.index);
                range.setEnd(node, found.index + found[0].length);
                const tops: Set<number> = new Set(Array.from(range.getClientRects()).map((rect: DOMRect): number => Math.round(rect.top)));

                expectThat(tops.size === 1, `${name}: число «${found[0]}» разорвано на ${tops.size} строки`);
            }
        }
    }
}

/** Ни один текст карточки не выходит за её край (SC-UKV-1461), блок не шире своей ячейки (SC-UKV-1479). */
function expectContained(block: HTMLElement, name: string): void {
    const width: number = Math.round(block.getBoundingClientRect().width);

    expectThat(block.scrollWidth <= width + 1, `${name}: блок раздвинут ${block.scrollWidth} > ${width}`);
    for (const card of Array.from(block.querySelectorAll<HTMLElement>(CARD))) {
        const edge: DOMRect = card.getBoundingClientRect();

        for (const { text, rect } of textRects(card)) {
            expectThat(rect.right <= edge.right + 0.5 && rect.left >= edge.left - 0.5, `${name}: «${text}» за краем карточки`);
        }
    }
}

/** Меряет каждый блок истории по его ширине: сколько колонок и какой ширины карточки. */
/**
 * Меряет блоки истории. `writtenValues: false` — значения поданы строкой: строка ставится как
 * пришла, кит её не записывает и переносит где придётся, поэтому целость числа не проверяется.
 */
async function measure(
    root: HTMLElement,
    expected: Readonly<Record<number, { columns: number; card?: number }>>,
    writtenValues: boolean = true
): Promise<void> {
    const blocks: HTMLElement[] = await settledAll(root, '[data-kpi-width]', Object.keys(expected).length);

    for (const block of blocks) {
        const width: number = Number(block.getAttribute('data-kpi-width'));
        expectThat(width in expected, `ширина ${width} не ожидалась`);

        const want: { columns: number; card?: number } | undefined = expected[width];
        const layout: ILayout = layoutOf(block);

        expectThat(layout.columns === want?.columns, `${width}: колонок ${layout.columns}, а не ${want?.columns}`);
        if (want?.card !== undefined) {
            expectThat(layout.widths[0] === want.card, `${width}: карточка ${layout.widths[0]}, а не ${want.card}`);
        }
        expectRows(layout, String(width));
        expectContained(block, String(width));
        if (writtenValues) {
            expectWholeNumbers(block, String(width));
        }
    }
}

/**
 * Три ширины макета: две колонки при 328 и 386, четыре при 728; карточки 160, 189 и 176 — SC-UKV-1437,
 * SC-UKV-1438, SC-UKV-1460, SC-UKV-1464.
 */
export const Widths: TStory = {
    args: { part: 'widths' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> =>
        measure(canvasElement, { 328: { columns: 2, card: 160 }, 386: { columns: 2, card: 189 }, 728: { columns: 4, card: 176 } }),
};

/** Порог четырёх колонок: 663 — две, 664 — четыре по 160 — SC-UKV-1439. */
export const Threshold: TStory = {
    args: { part: 'threshold' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> =>
        measure(canvasElement, { 663: { columns: 2 }, 664: { columns: 4, card: 160 } }),
};

/** Уже 328 — одна колонка во всю ширину — SC-UKV-1473. */
export const Below: TStory = {
    args: { part: 'below' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => measure(canvasElement, { 280: { columns: 1, card: 280 } }),
};

/** Рост, падение, ноль и записанный нулём малый рост; рост, который плох, — цветом опасности — SC-UKV-1448, SC-UKV-1449. */
export const Deltas: TStory = { args: { part: 'deltas' } };

/**
 * При 328: «1,24 млн ₽» рядом с «8 400 ₽», «2,5 млрд», дельта в пунктах, «-123 млрд ₽» шрифтом 20,
 * «-999 999 ₽» без дробной части и самое широкое число с дробью «-99 999,99 ₽» шрифтом 20 —
 * SC-UKV-1441, SC-UKV-1476, SC-UKV-1484, SC-UKV-1485.
 */
export const Short: TStory = {
    args: { part: 'short' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        await measure(canvasElement, { 328: { columns: 2, card: 160 } });
        const steps: string = Array.from((await firstBlock(canvasElement)).querySelectorAll<HTMLElement>(VALUE))
            .map((value: HTMLElement): string => `${(value.textContent ?? '').replace(/\s+/g, ' ').trim()}=${value.dataset['fit']}`)
            .join('; ');
        const want: string =
            '1,24 млн ₽=full; 8 400 ₽=full; 2,5 млрд=full; 42,0 %=full; -123 млрд ₽=smaller; -999 999 ₽=full; -99 999,99 ₽=smaller';

        expectThat(steps === want, `шаги размера значений: ${steps}`);
    },
};

/** Карточки без дельты, без периода, с дельтой без базы и со строкой вместо числа — SC-UKV-1443, SC-UKV-1450. */
export const Parts: TStory = { args: { part: 'parts' } };

/** Три карточки при 328 и 386, девять при 728: короткий последний ряд держит ширину колонки — SC-UKV-1460. */
export const Odd: TStory = {
    args: { part: 'odd' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> =>
        measure(canvasElement, { 328: { columns: 2, card: 160 }, 386: { columns: 2, card: 189 }, 728: { columns: 4, card: 176 } }),
};

/**
 * Длинные тексты при 328: подпись базы и период переносятся, длинное значение и подпись одним
 * словом рвутся, лента не раздвигается — SC-UKV-1461, SC-UKV-1479.
 */
export const Long: TStory = {
    args: { part: 'long' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => measure(canvasElement, { 328: { columns: 2, card: 160 } }, false),
};

/** items не список, пустой список и все карточки выпали: на месте блока заглушка — SC-UKV-1447, SC-UKV-1482. */
export const Invalid: TStory = { args: { part: 'invalid' } };

/** Два блока KPI в одном ответе между абзацами: каждый в своей сетке — SC-UKV-1481. */
export const Several: TStory = { args: { part: 'several' } };

/**
 * Блок под `dir="rtl"`: первая карточка справа, стрелка дельты справа от числа, «-1,24 млн ₽» и
 * «-4,2 %» в своём порядке — SC-UKV-1474.
 */
export const Rtl: TStory = {
    args: { part: 'rtl' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const block: HTMLElement = await firstBlock(canvasElement);
        const cards: HTMLElement[] = Array.from(block.querySelectorAll<HTMLElement>(CARD));
        const first: HTMLElement = cards[0];
        const number: DOMRect | undefined = first.querySelector('[qa-dataid="stat-tile-delta-percent"]')?.getBoundingClientRect();
        const arrow: DOMRect | undefined = first.querySelector('[qa-dataid="stat-tile-delta-icon"]')?.getBoundingClientRect();
        const value: string = (first.querySelector(VALUE)?.textContent ?? '').replace(/\s+/g, ' ').trim();

        expectThat(first.getBoundingClientRect().left > cards[1].getBoundingClientRect().left, 'справа налево: первая карточка не справа');
        expectThat(number !== undefined && arrow !== undefined && arrow.left >= number.right, 'справа налево: стрелка не справа от числа');
        expectThat(value === '-1,24 млн ₽', `справа налево: значение «${value}»`);
        expectThat(leftOf(first, '-') < leftOf(first, '₽'), 'справа налево: минус значения не слева от единицы');
    },
};

/** Ответ из четырёх карточек в узкой панели чата: две колонки — SC-UKV-1437. */
export const Panel: TStory = {
    args: { part: 'panel' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const block: HTMLElement = await firstBlock(canvasElement);

        expectThat(layoutOf(block).columns === 2, `панель: колонок ${layoutOf(block).columns}, а не 2`);
        expectRows(layoutOf(block), 'панель');
        expectContained(block, 'панель');
    },
};

/** Тот же ответ в полноэкранном режиме обычной ширины: четыре колонки — SC-UKV-1438. */
export const FullScreen: TStory = {
    args: { part: 'fullScreen' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const block: HTMLElement = await firstBlock(canvasElement);

        expectThat(layoutOf(block).columns === 4, `полный экран: колонок ${layoutOf(block).columns}, а не 4`);
        expectRows(layoutOf(block), 'полный экран');
    },
};

/** Полноэкранный режим с колонкой чтения 40rem: блок уже 664, две колонки — SC-UKV-1472. */
export const ReadingColumn: TStory = {
    args: { part: 'readingColumn' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const block: HTMLElement = await firstBlock(canvasElement);
        const width: number = Math.round(block.getBoundingClientRect().width);

        expectThat(width < 664, `колонка чтения: блок ${width}, не уже 664`);
        expectThat(layoutOf(block).columns === 2, `колонка чтения: колонок ${layoutOf(block).columns}, а не 2`);
        expectRows(layoutOf(block), 'колонка чтения');
    },
};

/** 328 и 728 в обоих наборах оформления. */
export const Presets: TStory = { args: { part: 'presets' } };

/** 328 и 728 в светлой и тёмной теме — SC-UKV-1465. */
export const Themes: TStory = { args: { part: 'themes' } };
