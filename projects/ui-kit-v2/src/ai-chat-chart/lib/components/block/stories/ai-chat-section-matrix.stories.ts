import { Meta, StoryObj } from '@storybook/angular';

import { TestRtAiChatSectionMatrixComponent } from './component/test-ai-chat-section-matrix.component';

/**
 * Матрицы блока секции — все случаи разом. Контролов нет намеренно: состояние, до которого надо
 * доехать переключателем, при беглом просмотре неотличимо от отсутствующего. Шаги `play` меряют
 * раскладку по `getBoundingClientRect`: ряды, ширины ячеек, общий верх ряда, шаг сетки, блок в
 * пределах ячейки и ленту, которую секция не раздвигает.
 */
export default {
    title: 'Organisms/Chat/AiChatSection',
    component: TestRtAiChatSectionMatrixComponent,
    parameters: { controls: { disable: true } },
} as Meta<TestRtAiChatSectionMatrixComponent>;

type TStory = StoryObj<TestRtAiChatSectionMatrixComponent>;

const SECTION: string = 'rt-ai-chat-section';
const CELL: string = '[qa-dataid="ai-chat-section-cell"]';
const GRID: string = '[qa-dataid="ai-chat-section-grid"]';
const TITLE: string = '[qa-dataid="ai-chat-section-title"]';
const KPI_CARD: string = '[qa-dataid="ai-chat-kpi-card"]';
const PLOT: string = 'rt-ai-chat-chart canvas, rt-ai-chat-chart svg';
const CHART: string = '[qa-dataid="ai-chat-chart-chart"]';
const PLATE: string = '[qa-dataid="ai-chat-block-unsupported"]';

/** Шаг сетки и зазор вокруг секции в ленте. */
const GAP: number = 16;

interface IPlayContext {
    readonly canvasElement: HTMLElement;
}

function expectThat(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

/** Ждёт шрифты, столько узлов по выбору и нарисованные графики: до них высоты рядов ещё не встали. */
async function settledAll(root: HTMLElement, selector: string, count: number = 1): Promise<HTMLElement[]> {
    await document.fonts.ready;

    return new Promise<HTMLElement[]>((resolve: (nodes: HTMLElement[]) => void): void => {
        const look: () => void = (): void => {
            const nodes: HTMLElement[] = Array.from(root.querySelectorAll<HTMLElement>(selector));
            const charts: number = root.querySelectorAll('rt-ai-chat-chart').length;

            if (nodes.length < count || root.querySelectorAll(PLOT).length < charts) {
                requestAnimationFrame(look);
            } else {
                requestAnimationFrame((): void => {
                    requestAnimationFrame((): void => resolve(nodes));
                });
            }
        };
        look();
    });
}

/** Ряды секции: ячейки, сгруппированные по верху, слева направо. */
function rowsOf(section: HTMLElement): DOMRect[][] {
    const cells: DOMRect[] = Array.from(section.querySelectorAll<HTMLElement>(CELL)).map((cell: HTMLElement): DOMRect =>
        cell.getBoundingClientRect()
    );
    const tops: number[] = [...new Set(cells.map((rect: DOMRect): number => Math.round(rect.top)))];

    return tops.map((top: number): DOMRect[] =>
        cells.filter((rect: DOMRect): boolean => Math.round(rect.top) === top).sort((a: DOMRect, b: DOMRect): number => a.left - b.left)
    );
}

function near(actual: number, expected: number): boolean {
    return Math.abs(actual - expected) <= 0.5;
}

/** Ряды такой ширины, как ждали; между рядами и между столбцами ровно шаг сетки. */
function expectRows(section: HTMLElement, expected: readonly (readonly number[])[], name: string): void {
    const rows: DOMRect[][] = rowsOf(section);
    const widths: string = rows
        .map((row: DOMRect[]): string => row.map((rect: DOMRect): number => Math.round(rect.width)).join('+'))
        .join(' / ');
    const want: string = expected.map((row: readonly number[]): string => row.join('+')).join(' / ');

    expectThat(widths === want, `${name}: ряды ${widths}, а не ${want}`);
    rows.forEach((row: DOMRect[], index: number): void => {
        row.slice(1).forEach((rect: DOMRect, at: number): void => {
            expectThat(
                near(rect.left - row[at].right, GAP),
                `${name}: столбцы ряда ${index + 1} в ${rect.left - row[at].right}, а не в ${GAP}`
            );
        });
        if (index > 0) {
            const above: number = Math.max(...rows[index - 1].map((rect: DOMRect): number => rect.bottom));

            expectThat(near(row[0].top - above, GAP), `${name}: ряд ${index + 1} в ${row[0].top - above} от ряда выше, а не в ${GAP}`);
        }
    });
}

/** Ни один блок не выходит за свою ячейку, ячейка — за секцию, секция не раздвигает свой хост. */
function expectContained(section: HTMLElement, name: string): void {
    const edge: DOMRect = section.getBoundingClientRect();

    expectThat(section.scrollWidth <= Math.round(edge.width) + 1, `${name}: секция раздвинута ${section.scrollWidth} > ${edge.width}`);
    for (const cell of Array.from(section.querySelectorAll<HTMLElement>(CELL))) {
        const box: DOMRect = cell.getBoundingClientRect();

        expectThat(box.left >= edge.left - 0.5 && box.right <= edge.right + 0.5, `${name}: ячейка за краем секции`);
        for (const block of Array.from(cell.children)) {
            const rect: DOMRect = block.getBoundingClientRect();

            expectThat(rect.width > 0 && rect.height > 0, `${name}: блок <${block.tagName.toLowerCase()}> пуст`);
            expectThat(
                block.scrollWidth <= Math.round(rect.width) + 1,
                `${name}: <${block.tagName.toLowerCase()}> раздвинут своим содержимым ${block.scrollWidth} > ${rect.width}`
            );
            expectThat(
                rect.left >= box.left - 0.5 && rect.right <= box.right + 0.5,
                `${name}: <${block.tagName.toLowerCase()}> за краем ячейки`
            );
        }
    }
}

/** Строки текста узла: его собственный прямоугольник не шире хоста и переполнения не выдаёт. */
function textRects(node: Element): DOMRect[] {
    const range: Range = document.createRange();
    range.selectNodeContents(node);

    return Array.from(range.getClientRects());
}

/** Заголовок: строка 20, 12 над сеткой, ни одна строка его текста не выходит за секцию. */
function expectTitle(section: HTMLElement, name: string): void {
    const heading: Element | null = section.querySelector(TITLE);
    const title: DOMRect | undefined = heading?.getBoundingClientRect();
    const grid: DOMRect | undefined = section.querySelector(GRID)?.getBoundingClientRect();
    const edge: DOMRect = section.getBoundingClientRect();

    if (title === undefined || grid === undefined) {
        throw new Error(`${name}: заголовка или сетки нет`);
    }
    expectThat(near(title.height % 20, 0) && title.height >= 20, `${name}: заголовок ${title.height}, не кратен строке 20`);
    expectThat(near(grid.top - title.bottom, 12), `${name}: заголовок в ${grid.top - title.bottom} над сеткой, а не в 12`);
    expectThat(title.right <= edge.right + 0.5 && title.left >= edge.left - 0.5, `${name}: заголовок за краем секции`);
    for (const line of heading === null ? [] : textRects(heading)) {
        expectThat(line.left >= edge.left - 0.5 && line.right <= edge.right + 0.5, `${name}: текст заголовка за краем секции`);
    }
}

/** Обзор нарисован целиком: оба графика с площадью и ни одной заглушки. */
function expectOverviewDrawn(section: HTMLElement, name: string): void {
    const charts: DOMRect[] = Array.from(section.querySelectorAll(CHART)).map((chart: Element): DOMRect => chart.getBoundingClientRect());

    expectThat(charts.length === 2, `${name}: графиков ${charts.length}, а не 2`);
    expectThat(
        charts.every((rect: DOMRect): boolean => rect.width > 100 && rect.height > 100),
        `${name}: график нарисован без площади`
    );
    expectThat(section.querySelectorAll(PLATE).length === 0, `${name}: в обзоре есть заглушка`);
}

/** Сколько карточек KPI стоит в первом ряду блока. */
function kpiColumns(section: HTMLElement): number {
    const cards: DOMRect[] = Array.from(section.querySelectorAll<HTMLElement>(KPI_CARD)).map((card: HTMLElement): DOMRect =>
        card.getBoundingClientRect()
    );

    return cards.filter((rect: DOMRect): boolean => Math.round(rect.top) === Math.round(cards[0].top)).length;
}

/** Секция хоста с этой шириной ленты, когда она встала. */
async function sectionAt(root: HTMLElement, width: number): Promise<HTMLElement> {
    const sections: HTMLElement[] = await settledAll(root, `[data-section-width="${width}"] ${SECTION}`);

    return sections[0];
}

/** Меряет секцию каждой ширины: ряды, шаг, блоки в ячейках, заголовок. */
async function measure(root: HTMLElement, expected: Readonly<Record<number, readonly (readonly number[])[]>>): Promise<void> {
    for (const [key, rows] of Object.entries(expected)) {
        const section: HTMLElement = await sectionAt(root, Number(key));

        expectThat(near(section.getBoundingClientRect().width, Number(key)), `${key}: секция ${section.getBoundingClientRect().width}`);
        expectRows(section, rows, key);
        expectContained(section, key);
        if (section.querySelector(TITLE) !== null) {
            expectTitle(section, key);
        }
    }
}

/** Меряет обзор каждой ширины и требует, чтобы он был нарисован целиком. */
async function measureOverview(root: HTMLElement, expected: Readonly<Record<number, readonly (readonly number[])[]>>): Promise<void> {
    await measure(root, expected);
    for (const key of Object.keys(expected)) {
        expectOverviewDrawn(await sectionAt(root, Number(key)), key);
    }
}

/** Обзор в одну колонку: пять блоков друг под другом. */
function stacked(width: number): readonly (readonly number[])[] {
    return [[width], [width], [width], [width], [width]];
}

/**
 * Четыре ширины макета. 328 и 386 — одна колонка; 640 — графики по 312; 926 — графики по 455 на
 * одном верхе, KPI в четыре колонки — SC-UKV-1508, SC-UKV-1509.
 */
export const Widths: TStory = {
    args: { part: 'widths' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        await measureOverview(canvasElement, {
            328: stacked(328),
            386: stacked(386),
            640: [[640], [640], [312, 312], [640]],
            926: [[926], [926], [455, 455], [926]],
        });
        expectThat(kpiColumns(await sectionAt(canvasElement, 640)) === 2, '640: KPI не в две колонки');
        expectThat(kpiColumns(await sectionAt(canvasElement, 926)) === 4, '926: KPI не в четыре колонки');
    },
};

/** Порог двух колонок: 599 — одна, 600 — две по 292 — SC-UKV-1510. */
export const Threshold: TStory = {
    args: { part: 'threshold' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> =>
        measureOverview(canvasElement, { 599: stacked(599), 600: [[600], [600], [292, 292], [600]] }),
};

/** Три графика при 926: третий один во втором ряду, шириной в столбец, у начала строки — SC-UKV-1513. */
export const Lone: TStory = {
    args: { part: 'lone' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        await measure(canvasElement, { 926: [[455, 455], [455]] });
        const section: HTMLElement = await sectionAt(canvasElement, 926);

        expectThat(near(rowsOf(section)[1][0].left, section.getBoundingClientRect().left), 'одинокий блок стоит не у начала строки');
    },
};

/**
 * Блок называет своё место: при 926 график на всю строку, таблица в столбце рядом с графиком; при
 * 386 все три друг под другом во всю ширину — SC-UKV-1526.
 */
export const Span: TStory = {
    args: { part: 'span' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> =>
        measure(canvasElement, { 926: [[926], [455, 455]], 386: [[386], [386], [386]] }),
};

/** Без заголовка, длинный заголовок в две строки и слово длиннее секции — SC-UKV-1520, SC-UKV-1528. */
export const Titles: TStory = {
    args: { part: 'titles' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const sections: HTMLElement[] = await settledAll(canvasElement, SECTION, 3);
        const [bare, long, word]: HTMLElement[] = sections;
        const grid: DOMRect | undefined = bare.querySelector(GRID)?.getBoundingClientRect();

        expectThat(bare.querySelector(TITLE) === null, 'без заголовка: заголовок нарисован');
        expectThat(grid !== undefined && near(grid.top, bare.getBoundingClientRect().top), 'без заголовка: над сеткой есть зазор');
        expectThat((long.querySelector(TITLE)?.getBoundingClientRect().height ?? 0) >= 40, 'длинный заголовок не перенёсся');
        for (const [section, name] of [
            [long, 'длинный заголовок'],
            [word, 'слово длиннее секции'],
        ] as const) {
            expectTitle(section, name);
            expectContained(section, name);
        }
    },
};

/** Секция в секции и блок неизвестного типа: заглушка в столбце рядом с графиком. */
export const Plates: TStory = {
    args: { part: 'plates' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const sections: HTMLElement[] = await settledAll(canvasElement, SECTION, 2);

        sections.forEach((section: HTMLElement, index: number): void => {
            expectRows(section, [[455, 455]], `заглушка ${index + 1}`);
            expectContained(section, `заглушка ${index + 1}`);
            expectThat(section.querySelectorAll(PLATE).length === 1, `заглушка ${index + 1}: не одна`);
        });
    },
};

/** KPI в столбце секции 640: ячейка 312, карточки в одну колонку — SC-UKV-1522. */
export const KpiInCell: TStory = {
    args: { part: 'kpi' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        await measure(canvasElement, { 640: [[312, 312]] });
        expectThat(kpiColumns(await sectionAt(canvasElement, 640)) === 1, 'KPI в ячейке 312 не в одну колонку');
    },
};

/** Имя блока ленты для сообщения проверки. */
function blockName(block: HTMLElement): string {
    return block.matches(SECTION) ? 'секция' : `<${block.tagName.toLowerCase()}>`;
}

/**
 * Соседи по ленте: секция в 16 от текста, от другой секции, от графика и от заглушки; блоки без
 * секции рядом — в обычных 8. Секция первой в ленте стоит у её верха, ряды внутри в 16 — SC-UKV-1528.
 */
export const TwoSections: TStory = {
    args: { part: 'two' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const sections: HTMLElement[] = await settledAll(canvasElement, SECTION, 4);
        const feed: HTMLElement | null = canvasElement.querySelector<HTMLElement>('rt-ai-chat-blocks');
        const blocks: HTMLElement[] = Array.from(feed?.children ?? []).filter(
            (node: Element): node is HTMLElement => node instanceof HTMLElement
        );
        const rects: DOMRect[] = blocks.map((block: HTMLElement): DOMRect => block.getBoundingClientRect());
        const grid: DOMRect | undefined = sections[1].querySelector(GRID)?.getBoundingClientRect();

        if (feed === null || grid === undefined) {
            throw new Error('соседи секции: ленты или сетки нет');
        }
        expectThat(blocks.length === 8, `соседи секции: блоков ${blocks.length}, а не 8`);
        expectThat(near(rects[0].top, feed.getBoundingClientRect().top), 'секция первой в ленте: над ней есть зазор');
        expectThat(near(rects[rects.length - 1].bottom, feed.getBoundingClientRect().bottom), 'последний блок ленты: под ним есть зазор');
        blocks.slice(1).forEach((block: HTMLElement, at: number): void => {
            const want: number = block.matches(SECTION) || blocks[at].matches(SECTION) ? GAP : GAP / 2;
            const gap: number = rects[at + 1].top - rects[at].bottom;

            expectThat(near(gap, want), `${blockName(blocks[at])} → ${blockName(block)}: зазор ${gap}, а не ${want}`);
        });
        expectThat(near(grid.top, sections[1].getBoundingClientRect().top), 'секция без заголовка: над сеткой есть зазор');
        expectRows(sections[1], [[386], [386]], 'вторая секция');
        expectTitle(sections[0], 'первая секция');
    },
};

/** Обзор при 926 под `dir="rtl"`: первый график справа от второго — SC-UKV-1521. */
export const Rtl: TStory = {
    args: { part: 'rtl' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        await measureOverview(canvasElement, { 926: [[926], [926], [455, 455], [926]] });
        const cells: HTMLElement[] = Array.from((await sectionAt(canvasElement, 926)).querySelectorAll<HTMLElement>(CELL));

        expectThat(cells[2].getBoundingClientRect().left > cells[3].getBoundingClientRect().left, 'справа налево: первый график не справа');
    },
};

/** Секция без blocks, с пустым списком и без блоков в списке: на её месте заглушка. */
export const Invalid: TStory = { args: { part: 'invalid' } };

interface IChatWant {
    readonly name: string;
    /** Графики рядом на одном верхе или друг под другом. */
    readonly columns: 1 | 2;
}

function nextFrame(): Promise<void> {
    return new Promise<void>((resolve: () => void): void => {
        requestAnimationFrame((): void => resolve());
    });
}

/**
 * Ставит ленту чата на начало ответа и ждёт, пока она там устоит. Чат после отрисовки ещё
 * несколько раз подтягивает ленту к хвосту, пока не увидит, что читатель ушёл вверх сам, поэтому
 * одной прокрутки мало: лента возвращается на начало, пока не простоит там шестьдесят кадров.
 */
async function scrolledToStart(feed: HTMLElement): Promise<void> {
    let held: number = 0;

    for (let frame: number = 0; frame < 600 && held < 60; frame += 1) {
        if (feed.scrollTop === 0) {
            held += 1;
        } else {
            feed.scrollTop = 0;
            held = 0;
        }
        await nextFrame();
    }
}

/** Меряет ответ в чате: колонки графиков, блоки в ячейках, заголовок и лента, которую секция не раздвигает. */
async function measureChat(root: HTMLElement, want: IChatWant): Promise<void> {
    const sections: HTMLElement[] = await settledAll(root, SECTION);
    const section: HTMLElement = sections[0];
    const feed: HTMLElement | null = root.querySelector<HTMLElement>('[qa-dataid="ai-chat-feed"]');
    const cells: DOMRect[] = Array.from(section.querySelectorAll<HTMLElement>(CELL)).map((cell: HTMLElement): DOMRect =>
        cell.getBoundingClientRect()
    );
    const sameTop: boolean = Math.round(cells[2].top) === Math.round(cells[3].top);
    const width: number = Math.round(section.getBoundingClientRect().width);

    if (feed === null) {
        throw new Error(`${want.name}: ленты нет`);
    }
    expectThat(feed.scrollHeight > feed.clientHeight, `${want.name}: ответ не выше ленты, полосы прокрутки нет`);
    expectThat(feed.scrollWidth <= feed.clientWidth, `${want.name}: лента раздвинута ${feed.scrollWidth} > ${feed.clientWidth}`);
    expectThat(sameTop === (want.columns === 2), `${want.name}: секция ${width}, графики ${sameTop ? 'рядом' : 'друг под другом'}`);
    if (want.columns === 2) {
        expectThat(
            near(cells[2].width, (section.getBoundingClientRect().width - GAP) / 2),
            `${want.name}: столбец ${cells[2].width} при секции ${width}`
        );
        expectThat(width >= 600, `${want.name}: две колонки при секции ${width}`);
    } else {
        expectThat(near(cells[2].width, section.getBoundingClientRect().width), `${want.name}: блок ${cells[2].width} при секции ${width}`);
    }
    expectContained(section, want.name);
    expectTitle(section, want.name);
    expectOverviewDrawn(section, want.name);
    // Кадр снимается с начала ответа: с хвоста в нём видна только таблица, а заголовок и KPI — нет.
    await scrolledToStart(feed);
    expectThat(feed.scrollTop === 0, `${want.name}: лента вернулась к хвосту ответа`);
}

/** Узкая панель чата: обзор в одну колонку, заголовок перенесён, лента не раздвинута — SC-UKV-1508, SC-UKV-1520. */
export const Panel: TStory = {
    args: { part: 'panel' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => measureChat(canvasElement, { name: 'панель', columns: 1 }),
};

/** Полноэкранный режим без колонки бесед: графики рядом — SC-UKV-1509, SC-UKV-1520. */
export const FullScreen: TStory = {
    args: { part: 'fullScreen' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => measureChat(canvasElement, { name: 'полный экран', columns: 2 }),
};

/** Полноэкранный режим с колонкой бесед: лента прокручивается, графики всё равно рядом — SC-UKV-1527. */
export const FullScreenThreads: TStory = {
    args: { part: 'threads' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => measureChat(canvasElement, { name: 'колонка бесед', columns: 2 }),
};

/** Полноэкранный режим с колонкой чтения 40rem: графики рядом — SC-UKV-1527. */
export const ReadingColumn: TStory = {
    args: { part: 'readingColumn' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => measureChat(canvasElement, { name: 'колонка чтения', columns: 2 }),
};

/** 386 и 926 в обоих наборах оформления. */
export const Presets: TStory = { args: { part: 'presets' } };

/** 386 и 926 в светлой и тёмной теме — SC-UKV-1529. */
export const Themes: TStory = { args: { part: 'themes' } };
