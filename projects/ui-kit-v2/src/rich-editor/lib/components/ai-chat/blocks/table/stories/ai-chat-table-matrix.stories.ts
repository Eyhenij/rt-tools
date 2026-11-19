import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../../../../showcase';
import { TestRtAiChatTableMatrixComponent } from './component/test-ai-chat-table-matrix.component';

/**
 * Матрицы блока таблицы — все случаи разом. Контролов нет намеренно: состояние, до которого надо
 * доехать переключателем, при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Organisms/Chat/AiChatTable',
    component: TestRtAiChatTableMatrixComponent,
    parameters: { controls: { disable: true } },
} as Meta<TestRtAiChatTableMatrixComponent>;

type TStory = StoryObj<TestRtAiChatTableMatrixComponent>;

interface IPlayContext {
    readonly canvasElement: HTMLElement;
}

/** Ждёт, пока в истории встанет узел по выбору, и отдаёт его. */
async function settled<NODE extends Element>(root: HTMLElement, selector: string): Promise<NODE> {
    return new Promise<NODE>((resolve: (node: NODE) => void): void => {
        const look: () => void = (): void => {
            const node: NODE | null = root.querySelector<NODE>(selector);

            if (node === null) {
                requestAnimationFrame(look);
            } else {
                resolve(node);
            }
        };
        look();
    });
}

/** Ждёт кадр после прокрутки: событие и перерисовка приходят до следующего кадра. */
async function nextFrame(): Promise<void> {
    await new Promise<void>((resolve: () => void): void => {
        requestAnimationFrame((): void => {
            requestAnimationFrame((): void => resolve());
        });
    });
}

function expectThat(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

/**
 * Четыре столбца в ленте 328: «Апартаменты у моря» переносится в своей ячейке, числа нет — SC-UKV-1409;
 * три числовых столбца без текстового — таблица по своему содержимому, SC-UKV-1422.
 */
export const Narrow: TStory = { args: { part: 'narrow' } };

/**
 * Тринадцать столбцов в ленте 328: окно прокручивается вбок, блок остаётся 328 — SC-UKV-1407. Шаг
 * `play` прокручивает окно присвоением: нажатие клавиши из сценария окно не двигает.
 */
export const Wide: TStory = {
    args: { part: 'wide' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const box: HTMLElement = await settled<HTMLElement>(canvasElement, '[qa-dataid="ai-chat-table-scroll"]');
        const block: HTMLElement = await settled<HTMLElement>(canvasElement, 'rt-ai-chat-table');

        box.scrollLeft = 120;
        await nextFrame();

        expectThat(box.scrollWidth > box.clientWidth, `таблица не шире окна: ${box.scrollWidth} ≤ ${box.clientWidth}`);
        expectThat(box.scrollLeft > 0, 'окно не прокрутилось вбок');
        expectThat(Math.round(block.getBoundingClientRect().width) === 328, `блок не 328: ${block.getBoundingClientRect().width}`);
    },
};

/** С итогом и без него: строка итога полужирная над верхней границей — SC-UKV-1404. */
export const WithTotal: TStory = { args: { part: 'total' } };

/** Минус цветом ошибки, ноль без цвета, строка в числовом столбце как пришла — SC-UKV-1400, SC-UKV-1401. */
export const Negatives: TStory = { args: { part: 'negatives' } };

/**
 * Девять строк: таблица выше 200 прокручивается вниз, шапка остаётся у верха окна — SC-UKV-1408.
 * Шаг `play` наводит фокус на окно и прокручивает его присвоением.
 */
export const Scrolled: TStory = {
    args: { part: 'scrolled' },
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const box: HTMLElement = await settled<HTMLElement>(canvasElement, '[qa-dataid="ai-chat-table-scroll"]');
        const head: HTMLElement = await settled<HTMLElement>(canvasElement, '[qa-dataid="ai-chat-table-head-cell"]');

        box.focus();
        box.scrollTop = 80;
        await nextFrame();

        const boxTop: number = Math.round(box.getBoundingClientRect().top);
        const headTop: number = Math.round(head.getBoundingClientRect().top);

        expectThat(box.scrollTop > 0, 'окно не прокрутилось вниз');
        expectThat(headTop === boxTop, `шапка не у верха окна: ${headTop} ≠ ${boxTop}`);
    },
};

/**
 * «Скопировать CSV» нажата: кнопка показывает «Скопировано» с галочкой — SC-UKV-1412. Подтверждение
 * живёт две секунды, кадр его не застаёт наверняка: вид держит проверка шага `play`.
 */
export const Copied: TStory = {
    args: { part: 'copied' },
    parameters: storySnapshotSkip('«Скопировано» живёт две секунды; вид держит проверка шага play'),
    play: async ({ canvasElement }: IPlayContext): Promise<void> => {
        const button: HTMLButtonElement = await settled<HTMLButtonElement>(canvasElement, '[qa-dataid="ai-chat-table-copy"]');
        const before: string = button.getAttribute('aria-label') ?? '';

        button.click();
        await nextFrame();

        expectThat((button.getAttribute('aria-label') ?? '') !== before, 'подпись кнопки не сменилась после копии');
    },
};

/** Шапка без строк и итог из пустых ячеек: таблица рисует шапку, итога нет — SC-UKV-1424. */
export const Empty: TStory = { args: { part: 'empty' } };

/** Блок без столбцов и со строками не списком: на его месте заглушка ленты. */
export const Invalid: TStory = { args: { part: 'invalid' } };

/** Блок рядом с таблицами разметки в одном ответе: общий вид, у разметки нет предела высоты — SC-UKV-1417. */
export const Markdown: TStory = { args: { part: 'markdown' } };

/** Блок и таблица разметки под `dir="rtl"`: края столбцов зеркалятся — SC-UKV-1397, SC-UKV-1418. */
export const Rtl: TStory = { args: { part: 'rtl' } };

/** Блок с итогом и блок с минусами в обоих наборах оформления. */
export const Presets: TStory = { args: { part: 'presets' } };

/** Светлая и тёмная половины — SC-UKV-1425. */
export const Themes: TStory = { args: { part: 'themes' } };
