import { Meta, StoryObj } from '@storybook/angular';

import { TestRtAiChatLinkMatrixComponent } from './component/test-ai-chat-link-matrix.component';

/**
 * Матрицы карточки ссылки — все случаи разом. Контролов нет намеренно: состояние, до которого надо
 * доехать переключателем, при беглом просмотре неотличимо от отсутствующего. Шаги `play` меряют
 * раскладку по `getBoundingClientRect` и ведут круг нажатия в чате.
 */
export default {
    title: 'Organisms/Chat/AiChatLink',
    component: TestRtAiChatLinkMatrixComponent,
    parameters: { controls: { disable: true } },
} as Meta<TestRtAiChatLinkMatrixComponent>;

type TStory = StoryObj<TestRtAiChatLinkMatrixComponent>;

const CARD: string = 'rt-ai-chat-link';
const ICON_BOX: string = '.rt-ai-chat-link__icon-box';
const TEXT: string = '.rt-ai-chat-link__text';
const ROW: string = '.rt-ai-chat-link__row';
const ACTIONS: string = '.rt-ai-chat-link__actions';
const TITLE: string = '[qa-dataid="ai-chat-link-title"]';
const SECTION: string = '[qa-dataid="ai-chat-link-section"]';
const STATUS: string = '[qa-dataid="ai-chat-link-status"]';
const REASON: string = '[qa-dataid="ai-chat-link-reason"]';
const OPEN: string = '[qa-dataid="ai-chat-link-open"]';
const NEW_TAB: string = '[qa-dataid="ai-chat-link-open-new-tab"]';
const LOG: string = '[qa-dataid="ai-chat-link-log"]';

/** Высота строки названия и раздела по договорённости: 14/17 и 12/16. */
const TITLE_LINE: number = 17;
const SECTION_LINE: number = 16;

/** Сколько ждать исхода в истории чата, мс: «открытие» в обёртке длится 300. */
const OUTCOME_TIMEOUT_MS: number = 5000;

interface IPlayContext {
    readonly canvasElement: HTMLElement;
}

function expectThat(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

/** Ждёт, пока условие не станет истинным, и отказывает словами, когда время вышло. */
async function until(condition: () => boolean, what: string, timeout: number = OUTCOME_TIMEOUT_MS): Promise<void> {
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

/** Карточки истории, когда их встало не меньше `count`. */
async function cardsOf(root: HTMLElement, count: number = 1): Promise<HTMLElement[]> {
    await until((): boolean => root.querySelectorAll(CARD).length >= count, `карточек ${count}`);

    return Array.from(root.querySelectorAll<HTMLElement>(CARD));
}

function rectOf(card: HTMLElement, selector: string): DOMRect {
    const node: HTMLElement | null = card.querySelector<HTMLElement>(selector);

    if (node === null) {
        throw new Error(`в карточке нет узла ${selector}`);
    }

    return node.getBoundingClientRect();
}

function textOf(card: HTMLElement, selector: string): string {
    return (card.querySelector(selector)?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function near(actual: number, expected: number): boolean {
    return Math.abs(actual - expected) <= 0.5;
}

/** Числа договорённости: коробка значка 36 на 36, 12 до текста, 12 до кнопок, кнопки 8 друг от друга. */
function expectNumbers(card: HTMLElement, name: string): void {
    const box: DOMRect = rectOf(card, ICON_BOX);
    const text: DOMRect = rectOf(card, TEXT);
    const row: DOMRect = rectOf(card, ROW);
    const actions: DOMRect = rectOf(card, ACTIONS);
    const edge: DOMRect = card.getBoundingClientRect();
    const gap: number = getComputedStyle(card).direction === 'rtl' ? box.left - text.right : text.left - box.right;

    expectThat(near(box.width, 36) && near(box.height, 36), `${name}: коробка значка ${box.width} на ${box.height}, а не 36 на 36`);
    expectThat(near(gap, 12), `${name}: от значка до текста ${gap}, а не 12`);
    expectThat(near(box.top, text.top), `${name}: значок не у верха колонки текста`);
    expectThat(near(actions.top - row.bottom, 12), `${name}: от ряда до кнопок ${actions.top - row.bottom}, а не 12`);
    expectThat(near(row.top - edge.top, 13), `${name}: поле карточки сверху ${row.top - edge.top}, а не 12 и рамка 1`);
}

/** Ничто не выходит за карточку и не раздвигает ленту. */
function expectContained(card: HTMLElement, name: string): void {
    const edge: DOMRect = card.getBoundingClientRect();

    expectThat(card.scrollWidth <= Math.round(edge.width) + 1, `${name}: карточка раздвинута ${card.scrollWidth} > ${edge.width}`);
    for (const selector of [TITLE, OPEN, NEW_TAB, TEXT, ACTIONS]) {
        const rect: DOMRect = rectOf(card, selector);

        expectThat(rect.left >= edge.left - 0.5 && rect.right <= edge.right + 0.5, `${name}: ${selector} за краем карточки`);
    }
}

/** Обе кнопки в одном ряду на одном верхе, 8 друг от друга. */
function expectOneRow(card: HTMLElement, name: string): void {
    const open: DOMRect = rectOf(card, OPEN);
    const newTab: DOMRect = rectOf(card, NEW_TAB);
    const gap: number = getComputedStyle(card).direction === 'rtl' ? open.left - newTab.right : newTab.left - open.right;

    expectThat(near(open.top, newTab.top), `${name}: кнопки на разном верхе ${open.top} и ${newTab.top}`);
    expectThat(near(gap, 8), `${name}: между кнопками ${gap}, а не 8`);
}

/** Меряет карточки каждой ленты истории: ширину, числа договорённости, ряд кнопок и края. */
async function measure(root: HTMLElement, cards: number): Promise<void> {
    await cardsOf(root, cards);
    for (const feed of Array.from(root.querySelectorAll<HTMLElement>('[data-link-width]'))) {
        const width: number = Number(feed.dataset['linkWidth']);

        for (const card of Array.from(feed.querySelectorAll<HTMLElement>(CARD))) {
            const name: string = `${width} «${textOf(card, TITLE).slice(0, 24)}»`;

            expectThat(
                near(card.getBoundingClientRect().width, width),
                `${name}: карточка ${card.getBoundingClientRect().width}, а не ${width}`
            );
            expectNumbers(card, name);
            expectOneRow(card, name);
            expectContained(card, name);
        }
    }
}

/**
 * Четыре карточки макета при 328, 386 и 640: коробка значка 36, просветы 12 и 8, кнопки в одном
 * ряду, длинное название в две строки с многоточием, раздел в одну — SC-UKV-1498.
 */
export const Widths: TStory = {
    args: { part: 'widths' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        await measure(canvasElement, 12);
        for (const feed of Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-link-width]'))) {
            const long: HTMLElement = Array.from(feed.querySelectorAll<HTMLElement>(CARD))[3];
            const title: HTMLElement | null = long.querySelector<HTMLElement>(TITLE);
            const section: HTMLElement | null = long.querySelector<HTMLElement>(SECTION);
            const width: string = feed.dataset['linkWidth'] ?? '';

            expectThat(title !== null && near(title.getBoundingClientRect().height, TITLE_LINE * 2), `${width}: название не в две строки`);
            expectThat(title !== null && title.scrollHeight > title.clientHeight, `${width}: название не урезано многоточием`);
            expectThat(section !== null && near(section.getBoundingClientRect().height, SECTION_LINE), `${width}: раздел не в одну строку`);
            expectThat(section !== null && section.scrollWidth > section.clientWidth, `${width}: раздел не урезан многоточием`);
        }
    },
};

/** Открывается, открыта, не открылась с причиной и без, карточка без исхода — SC-UKV-1489…1492. */
export const States: TStory = {
    args: { part: 'states' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        await measure(canvasElement, 5);
        const cards: HTMLElement[] = await cardsOf(canvasElement, 5);
        const seen: string = cards
            .map((card: HTMLElement): string =>
                [textOf(card, STATUS), textOf(card, REASON), card.querySelector(OPEN)?.getAttribute('aria-disabled') ?? 'enabled'].join('|')
            )
            .join('; ');
        const want: string =
            'Открывается||true; Открыта||enabled; Не открылась|Нет доступа к разделу «Отчёты»|enabled; Не открылась||enabled; ||enabled';

        expectThat(seen === want, `исходы карточек: ${seen}`);
        const status: DOMRect = rectOf(cards[2], STATUS);
        const reason: DOMRect = rectOf(cards[2], REASON);

        expectThat(near(reason.top - status.bottom, 6), `причина ${reason.top - status.bottom} под меткой, а не 6`);
    },
};

/** Без раздела, без значка (значок `link`), длинные название и раздел. */
export const Parts: TStory = {
    args: { part: 'parts' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        await measure(canvasElement, 3);
        const cards: HTMLElement[] = await cardsOf(canvasElement, 3);

        expectThat(cards[0].querySelector(SECTION) === null, 'без раздела: строка раздела есть');
        await until(
            (): boolean => cards[1].querySelector(`${ICON_BOX} use`)?.getAttribute('href') === '#rt-icon-link',
            'значок link у карточки без значка'
        );
    },
};

/** Подписи кнопок длиннее ряда при 328: вторая кнопка под первой, ничто не за краем — SC-UKV-1503. */
export const LongLabels: TStory = {
    args: { part: 'longLabels' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        for (const card of await cardsOf(canvasElement, 2)) {
            const open: DOMRect = rectOf(card, OPEN);
            const newTab: DOMRect = rectOf(card, NEW_TAB);

            expectThat(newTab.top >= open.bottom, `длинные подписи: вторая кнопка не под первой (${newTab.top} и ${open.bottom})`);
            expectThat(near(newTab.top - open.bottom, 8), `длинные подписи: между рядами кнопок ${newTab.top - open.bottom}, а не 8`);
            expectContained(card, 'длинные подписи');
        }
    },
};

/** Блок без названия, без адреса и с адресом из пробелов: на месте блока заглушка — SC-UKV-1488. */
export const Invalid: TStory = { args: { part: 'invalid' } };

/** Под `dir="rtl"`: значок справа от текста, «Открыть» справа от второй кнопки — SC-UKV-1504. */
export const Rtl: TStory = {
    args: { part: 'rtl' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        await measure(canvasElement, 4);
        for (const card of await cardsOf(canvasElement, 4)) {
            expectThat(rectOf(card, ICON_BOX).left >= rectOf(card, TEXT).right, 'справа налево: значок не справа от текста');
            expectThat(rectOf(card, OPEN).left >= rectOf(card, NEW_TAB).right, 'справа налево: «Открыть» не справа от второй кнопки');
        }
    },
};

/** Нажимает кнопку карточки и ждёт метку исхода; отдаёт строки журнала событий. */
/** Цвет рамки кнопки «Открыть»: в ожидании она спокойная, а не прозрачная. */
function outlineOf(card: HTMLElement): string {
    const open: HTMLElement | null = card.querySelector<HTMLElement>(OPEN);

    return open === null ? '' : getComputedStyle(open).borderTopColor;
}

async function press(root: HTMLElement, index: number, button: string, outcome: string): Promise<string> {
    const card: HTMLElement = (await cardsOf(root, 3))[index];

    card.querySelector<HTMLElement>(button)?.click();
    await until((): boolean => textOf(card, STATUS) === 'Открывается', `«Открывается» у карточки ${index + 1}`);
    expectThat(card.querySelector(OPEN)?.getAttribute('aria-disabled') === 'true', 'в ожидании кнопка доступна');
    expectThat(outlineOf(card) !== 'rgba(0, 0, 0, 0)', 'в ожидании обводочная кнопка осталась без рамки');
    await until(
        (): boolean => textOf(root.querySelectorAll<HTMLElement>(CARD)[index], STATUS) === outcome,
        `«${outcome}» у карточки ${index + 1}`
    );

    return root.querySelector(LOG)?.textContent ?? '';
}

/** Круг целиком: нажатие даёт `linkOpen`, карточка идёт в «Открывается», затем в исход — SC-UKV-1493…1495. */
async function loop(root: HTMLElement): Promise<void> {
    const first: string = await press(root, 0, OPEN, 'Открыта');

    expectThat(
        first.trim() === '{"messageId":"a1","url":"/reports/sales?month=11","newTab":false}',
        `событие первой карточки: ${first.trim()}`
    );
    const both: string = await press(root, 1, NEW_TAB, 'Не открылась');
    const nested: string = await press(root, 2, OPEN, 'Открыта');
    const cards: HTMLElement[] = await cardsOf(root, 3);

    expectThat(nested.includes('{"messageId":"a1","url":"/warehouse/stock","newTab":false}'), `событие карточки в секции: ${nested}`);

    expectThat(both.includes('{"messageId":"a1","url":"/reports/finance","newTab":true}'), `событие второй карточки: ${both}`);
    expectThat(textOf(cards[1], REASON) === 'Нет доступа к разделу «Отчёты»', `причина второй карточки: ${textOf(cards[1], REASON)}`);
    expectThat(textOf(cards[0], STATUS) === 'Открыта', 'исход первой карточки сбит нажатием второй');
    for (const card of cards) {
        expectNumbers(card, 'чат');
        expectContained(card, 'чат');
    }
}

/** Ответ с двумя карточками и третьей в секции в узкой панели чата: нажатия, события и исходы. */
export const Panel: TStory = {
    args: { part: 'panel' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => loop(canvasElement),
};

/** Тот же ответ в полноэкранном режиме: карточки берут ширину колонки ответа. */
export const FullScreen: TStory = {
    args: { part: 'fullScreen' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => loop(canvasElement),
};

/** Четыре карточки макета при 328 в обоих наборах оформления. */
export const Presets: TStory = { args: { part: 'presets' } };

/** Четыре карточки макета при 328 в светлой и тёмной теме — SC-UKV-1505. */
export const Themes: TStory = { args: { part: 'themes' } };
