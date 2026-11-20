import { Meta, StoryObj } from '@storybook/angular';

import { TestRtAiChatSourcesMatrixComponent } from './component/test-ai-chat-sources-matrix.component';

/**
 * Матрицы блока источников — все случаи разом. Контролов нет намеренно: состояние, до которого надо
 * доехать переключателем, при беглом просмотре неотличимо от отсутствующего. Шаги `play`
 * раскрывают списки, меряют раскладку по `getBoundingClientRect` и ведут круг нажатия в чате.
 */
export default {
    title: 'Organisms/Chat/AiChatSources',
    component: TestRtAiChatSourcesMatrixComponent,
    parameters: { controls: { disable: true } },
} as Meta<TestRtAiChatSourcesMatrixComponent>;

type TStory = StoryObj<TestRtAiChatSourcesMatrixComponent>;

const BLOCK: string = 'rt-ai-chat-sources';
const HEADER: string = '.rt-expansion-panel__header';
const LIST: string = '[qa-dataid="ai-chat-sources-list"]';
const ROW: string = '.rt-ai-chat-sources__row';
const ICON: string = '.rt-ai-chat-sources__icon';
const TEXT: string = '.rt-ai-chat-sources__text';
const TITLE: string = '[qa-dataid="ai-chat-sources-title"]';
const DETAIL: string = '[qa-dataid="ai-chat-sources-detail"]';
const OPEN: string = '[qa-dataid="ai-chat-sources-open"]';
const LOG: string = '[qa-dataid="ai-chat-sources-log"]';

/** Сколько ждать раскрытия и события, мс. */
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

function rectOf(scope: HTMLElement, selector: string): DOMRect {
    const node: HTMLElement | null = scope.querySelector<HTMLElement>(selector);

    if (node === null) {
        throw new Error(`в блоке нет узла ${selector}`);
    }

    return node.getBoundingClientRect();
}

/** Блоки, когда их встало не меньше `count`. */
async function blocksOf(root: HTMLElement, count: number = 1): Promise<HTMLElement[]> {
    await until((): boolean => root.querySelectorAll(BLOCK).length >= count, `блоков ${count}`);

    return Array.from(root.querySelectorAll<HTMLElement>(BLOCK));
}

/** Раскрывает списки ячеек с отметкой `data-sources-open` и ждёт строк. */
async function openMarked(root: HTMLElement): Promise<void> {
    for (const cell of Array.from(root.querySelectorAll<HTMLElement>('[data-sources-open="true"]'))) {
        const header: HTMLElement | null = cell.querySelector<HTMLElement>(HEADER);

        // Повторный запуск шага не сворачивает уже раскрытый список.
        if (header?.getAttribute('aria-expanded') !== 'true') {
            header?.click();
        }

        await until((): boolean => cell.querySelector(LIST) !== null, 'список раскрытой ячейки');
    }
}

/**
 * Числа макета: заголовок 40, карточка с рамкой 1 и скруглением 12 и полями 4, значок 20 на 20,
 * 12 до текста, поле списка снизу 8. Строка с уточнением 51 высотой, без уточнения 36.
 */
function expectNumbers(block: HTMLElement, name: string): void {
    const style: CSSStyleDeclaration = getComputedStyle(block);
    const rtl: boolean = style.direction === 'rtl';
    const edge: DOMRect = block.getBoundingClientRect();
    const header: DOMRect = rectOf(block, HEADER);

    expectThat(near(header.height, 40), `${name}: заголовок ${header.height}, а не 40`);
    expectThat(
        style.borderTopWidth === '1px' && style.borderTopLeftRadius === '12px',
        `${name}: рамка и скругление ${style.borderTopWidth} ${style.borderTopLeftRadius}`
    );
    expectThat(near(header.top - edge.top, 5), `${name}: заголовок ${header.top - edge.top} от верха, а не 5 (рамка 1 и поле 4)`);

    const list: HTMLElement | null = block.querySelector<HTMLElement>(LIST);

    if (list === null) {
        return;
    }
    const rows: HTMLElement[] = Array.from(list.querySelectorAll<HTMLElement>(ROW));
    const last: DOMRect = rows[rows.length - 1].getBoundingClientRect();

    expectThat(near(edge.bottom - last.bottom, 13), `${name}: от последней строки до низа ${edge.bottom - last.bottom}, а не 13`);
    for (const row of rows) {
        const icon: DOMRect = rectOf(row, ICON);
        const text: DOMRect = rectOf(row, TEXT);
        const gap: number = rtl ? icon.left - text.right : text.left - icon.right;
        const detail: boolean = row.querySelector(DETAIL) !== null;
        const title: string = (row.querySelector(TITLE)?.textContent ?? '').slice(0, 24);

        expectThat(near(icon.width, 20) && near(icon.height, 20), `${name} «${title}»: значок ${icon.width} на ${icon.height}`);
        expectThat(near(gap, 12), `${name} «${title}»: от значка до текста ${gap}, а не 12`);
        expectThat(
            near(row.getBoundingClientRect().height, detail ? 51 : 36),
            `${name} «${title}»: строка ${row.getBoundingClientRect().height}`
        );
        expectThat(rtl ? icon.right <= edge.right - 12 : icon.left >= edge.left + 12, `${name} «${title}»: значок за полем карточки`);
    }
}

/** Ничто не выходит за блок и не раздвигает ленту. */
function expectContained(block: HTMLElement, name: string): void {
    const edge: DOMRect = block.getBoundingClientRect();

    expectThat(block.scrollWidth <= Math.round(edge.width) + 1, `${name}: блок раздвинут ${block.scrollWidth} > ${edge.width}`);
    for (const node of Array.from(block.querySelectorAll<HTMLElement>(`${TITLE}, ${DETAIL}, ${TEXT}`))) {
        const rect: DOMRect = node.getBoundingClientRect();

        expectThat(rect.left >= edge.left - 0.5 && rect.right <= edge.right + 0.5, `${name}: текст за краем блока`);
    }
}

async function measure(root: HTMLElement, blocks: number): Promise<void> {
    await blocksOf(root, blocks);
    await openMarked(root);
    for (const feed of Array.from(root.querySelectorAll<HTMLElement>('[data-sources-width]'))) {
        const width: number = Number(feed.dataset['sourcesWidth']);

        for (const block of Array.from(feed.querySelectorAll<HTMLElement>(BLOCK))) {
            expectThat(near(block.getBoundingClientRect().width, width), `${width}: блок ${block.getBoundingClientRect().width}`);
            expectNumbers(block, String(width));
            expectContained(block, String(width));
        }
    }
}

/**
 * Пять источников раскрыто при 328, 386 и 640: числа макета, названия и уточнения в одну строку
 * с многоточием — SC-UKV-1558.
 */
export const Widths: TStory = {
    args: { part: 'widths' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        await measure(canvasElement, 3);
        for (const feed of Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-sources-width]'))) {
            const long: HTMLElement = Array.from(feed.querySelectorAll<HTMLElement>(ROW))[4];
            const title: HTMLElement | null = long.querySelector<HTMLElement>(TITLE);
            const detail: HTMLElement | null = long.querySelector<HTMLElement>(DETAIL);
            const width: string = feed.dataset['sourcesWidth'] ?? '';

            expectThat(title !== null && title.getBoundingClientRect().height < 20, `${width}: название не в одну строку`);
            expectThat(title !== null && title.scrollWidth > title.clientWidth, `${width}: название не урезано многоточием`);
            expectThat(detail !== null && detail.scrollWidth > detail.clientWidth, `${width}: уточнение не урезано многоточием`);
        }
    },
};

/** Свёрнуто и раскрыто, один и пять источников; число в заголовке — SC-UKV-1542, 1543. */
export const States: TStory = {
    args: { part: 'states' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        await measure(canvasElement, 4);
        const counts: string = Array.from(canvasElement.querySelectorAll<HTMLElement>(BLOCK))
            .map((block: HTMLElement): string => block.querySelector('[qa-dataid="ai-chat-sources-count"]')?.textContent?.trim() ?? '')
            .join(',');

        expectThat(counts === '5,1,1,5', `числа в заголовках: ${counts}`);
        const collapsed: HTMLElement = canvasElement.querySelectorAll<HTMLElement>(BLOCK)[0];

        expectThat(
            near(collapsed.getBoundingClientRect().height, 50),
            `свёрнутый блок ${collapsed.getBoundingClientRect().height}, а не 50`
        );
    },
};

/** Без уточнения, без адреса, значок вне набора, длинные тексты, равные источники. */
export const Parts: TStory = {
    args: { part: 'parts' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        await measure(canvasElement, 5);
        const blocks: HTMLElement[] = await blocksOf(canvasElement, 5);

        expectThat(blocks[1].querySelector(OPEN) === null, 'без адреса: строка стала кнопкой');
        expectThat(blocks[0].querySelector(DETAIL) === null, 'без уточнения: строка уточнения есть');
        await until(
            (): boolean => blocks[2].querySelector(`${ICON} use`)?.getAttribute('href') === '#rt-icon-file',
            'значок file у источника со значком вне набора'
        );
        expectThat(blocks[4].querySelectorAll(ROW).length === 2, 'равные источники склеены');
    },
};

/** Блок без списка, пустой и без названий: на месте блока заглушка ленты — SC-UKV-1549. */
export const Invalid: TStory = { args: { part: 'invalid' } };

/** Под `dir="rtl"`: значок справа от текста, шеврон слева — SC-UKV-1559. */
export const Rtl: TStory = {
    args: { part: 'rtl' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        await measure(canvasElement, 1);
        const block: HTMLElement = (await blocksOf(canvasElement, 1))[0];

        for (const row of Array.from(block.querySelectorAll<HTMLElement>(ROW))) {
            expectThat(rectOf(row, ICON).left >= rectOf(row, TEXT).right, 'справа налево: значок не справа от текста');
        }
        expectThat(
            rectOf(block, '.rt-expansion-panel__chevron').right <= rectOf(block, '[qa-dataid="ai-chat-sources-label"]').left,
            'справа налево: шеврон не слева от подписи'
        );
    },
};

/** Ответ с источниками и источником в секции в узкой панели чата: раскрытие, нажатия и события — SC-UKV-1546, 1556. */
export const Panel: TStory = {
    args: { part: 'panel' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        await until((): boolean => canvasElement.querySelectorAll(HEADER).length >= 2, 'заголовки двух блоков');
        for (const header of Array.from(canvasElement.querySelectorAll<HTMLElement>(HEADER))) {
            header.click();
        }
        await until((): boolean => canvasElement.querySelectorAll(OPEN).length >= 2, 'кнопки источников с адресом');
        Array.from(canvasElement.querySelectorAll<HTMLElement>(OPEN)).forEach((button: HTMLElement): void => button.click());
        const log: string = canvasElement.querySelector(LOG)?.textContent ?? '';

        expectThat(
            log.includes('{"messageId":"a1","url":"/reports/sales","title":"Отчёт «Продажи»"}'),
            `событие первого источника: ${log}`
        );
        expectThat(log.includes('{"messageId":"a1","url":"/bookings","title":"Таблица броней"}'), `событие источника в секции: ${log}`);
    },
};

/** Раскрытый блок при 328 в обоих наборах оформления. */
export const Presets: TStory = {
    args: { part: 'presets' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => openMarked(canvasElement),
};

/** Раскрытый блок при 328 в светлой и тёмной теме. */
export const Themes: TStory = {
    args: { part: 'themes' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => openMarked(canvasElement),
};
