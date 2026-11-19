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
    const cards: DOMRect[] = Array.from(block.querySelectorAll<HTMLElement>('[qa-dataid="ai-chat-kpi-card"]')).map(
        (card: HTMLElement): DOMRect => card.getBoundingClientRect()
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

/** Ни один текст карточки не выходит за её край (SC-UKV-1461), блок не шире своей ячейки (SC-UKV-1479). */
function expectContained(block: HTMLElement, name: string): void {
    const width: number = Math.round(block.getBoundingClientRect().width);

    expectThat(block.scrollWidth <= width + 1, `${name}: блок раздвинут ${block.scrollWidth} > ${width}`);
    for (const card of Array.from(block.querySelectorAll<HTMLElement>('[qa-dataid="ai-chat-kpi-card"]'))) {
        const edge: DOMRect = card.getBoundingClientRect();

        for (const text of Array.from(card.querySelectorAll<HTMLElement>('p, span'))) {
            const rect: DOMRect = text.getBoundingClientRect();

            expectThat(
                rect.right <= edge.right + 0.5 && rect.left >= edge.left - 0.5,
                `${name}: «${text.textContent?.trim() ?? ''}» за краем карточки`
            );
        }
    }
}

/** Меряет каждый блок истории по его ширине: сколько колонок и какой ширины карточки. */
async function measure(root: HTMLElement, expected: Readonly<Record<number, { columns: number; card?: number }>>): Promise<void> {
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

/** «1,24 млн ₽» рядом с «8 400 ₽», «2,5 млрд» и дельта в пунктах — SC-UKV-1441, SC-UKV-1476. */
export const Short: TStory = { args: { part: 'short' } };

/** Карточки без дельты, без периода, с дельтой без базы и со строкой вместо числа — SC-UKV-1443, SC-UKV-1450. */
export const Parts: TStory = { args: { part: 'parts' } };

/** Три карточки при 386 и девять при 728: короткий последний ряд держит ширину колонки — SC-UKV-1460. */
export const Odd: TStory = {
    args: { part: 'odd' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> =>
        measure(canvasElement, { 386: { columns: 2, card: 189 }, 728: { columns: 4, card: 176 } }),
};

/** Длинные тексты при 328: подпись базы и период переносятся, длинное слово рвётся, лента не раздвигается — SC-UKV-1461, SC-UKV-1479. */
export const Long: TStory = {
    args: { part: 'long' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => measure(canvasElement, { 328: { columns: 2, card: 160 } }),
};

/** items не список, пустой список и все карточки выпали: на месте блока заглушка — SC-UKV-1447, SC-UKV-1482. */
export const Invalid: TStory = { args: { part: 'invalid' } };

/** Два блока KPI в одном ответе между абзацами: каждый в своей сетке — SC-UKV-1481. */
export const Several: TStory = { args: { part: 'several' } };

/** Блок под `dir="rtl"`: сетка и строка дельты зеркалятся, числа в своём порядке — SC-UKV-1474. */
export const Rtl: TStory = { args: { part: 'rtl' } };

/** Ответ из четырёх карточек в узкой панели чата: две колонки — SC-UKV-1437. */
export const Panel: TStory = {
    args: { part: 'panel' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const block: HTMLElement = await firstBlock(canvasElement);

        expectThat(layoutOf(block).columns === 2, `панель: колонок ${layoutOf(block).columns}, а не 2`);
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
    },
};

/** 328 и 728 в обоих наборах оформления. */
export const Presets: TStory = { args: { part: 'presets' } };

/** 328 и 728 в светлой и тёмной теме — SC-UKV-1465. */
export const Themes: TStory = { args: { part: 'themes' } };
