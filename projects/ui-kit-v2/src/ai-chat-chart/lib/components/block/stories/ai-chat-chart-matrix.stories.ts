import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../../showcase/story-overlay';
import { TestRtAiChatChartMatrixComponent } from './component/test-ai-chat-chart-matrix.component';

/**
 * Матрицы блока графика — все случаи разом. Контролов нет намеренно: состояние, до которого надо
 * доехать переключателем, при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Organisms/Chat/AiChatChart',
    component: TestRtAiChatChartMatrixComponent,
    parameters: { controls: { disable: true } },
} as Meta<TestRtAiChatChartMatrixComponent>;

type TStory = StoryObj<TestRtAiChatChartMatrixComponent>;

/** Десять видов по образцу спецификации каждого — SC-UKV-1341. */
export const Kinds: TStory = { args: { part: 'kinds' } };

/** Ожидание, негодная спецификация, пусто, круг из нулей, без заголовка, длинный заголовок, 60 категорий. */
export const States: TStory = { args: { part: 'states' } };

/**
 * Узкая лента, светлая и тёмная половины: шесть длинных рядов — SC-UKV-1355, девять секторов —
 * SC-UKV-1369, заголовок в 120 знаков с обеими кнопками — SC-UKV-1376.
 */
export const Edges: TStory = { args: { part: 'edges' } };

/** Узкий экран, панель и широкий экран: блок занимает всю ширину ленты — SC-UKV-1376. */
export const Widths: TStory = { args: { part: 'widths' } };

/** Ответ ассистента в беседе: текст, плашка и график в одной ленте — SC-UKV-1373. */
export const Answer: TStory = { args: { part: 'answer' } };

/** График на весь экран: история нажимает «Открыть на весь экран» — SC-UKV-1356. */
export const FullScreen: TStory = {
    parameters: { snapshot: { fullPage: true, overlay: '.rt-ai-chat-chart-dialog' } },
    args: { part: 'fullScreen' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { within: '[qa-dataid="ai-chat-chart-full-screen"] [qa-dataid="icon-button-control"]' });
    },
};

export const Presets: TStory = { args: { part: 'presets' } };

/** Открывает таблицы всех блоков истории и ждёт, пока каждая встанет в разметку. */
async function openData({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    const toggles: HTMLButtonElement[] = Array.from(
        canvasElement.querySelectorAll<HTMLButtonElement>('[qa-dataid="ai-chat-chart-toggle"]')
    );
    toggles.forEach((toggle: HTMLButtonElement): void => toggle.click());
    await new Promise<void>((resolve: () => void): void => {
        const ready: () => void = (): void => {
            if (canvasElement.querySelectorAll('[qa-dataid="ai-chat-chart-data"]').length >= toggles.length) {
                resolve();
            } else {
                requestAnimationFrame(ready);
            }
        };
        ready();
    });
}

/**
 * Таблица данных под графиком, светлая и тёмная половины: линия, столбики группой с минусом и нулём,
 * дерево по листьям — SC-UKV-1532, SC-UKV-1388, SC-UKV-1533.
 */
export const DataTable: TStory = { args: { part: 'data' }, play: openData };

/** Таблица в лентах 328, 386 и 728 и шесть рядов в узкой ленте — SC-UKV-1534. */
export const DataTableWidths: TStory = { args: { part: 'dataWidths' }, play: openData };

/** Дерево на 200 листьев: таблица растёт в высоту вместе с блоком. */
export const DataTableLong: TStory = { args: { part: 'dataLong' }, play: openData };

/** Десять видов в светлой и тёмной половине — SC-UKV-1369. */
export const Themes: TStory = { args: { part: 'themes' } };
