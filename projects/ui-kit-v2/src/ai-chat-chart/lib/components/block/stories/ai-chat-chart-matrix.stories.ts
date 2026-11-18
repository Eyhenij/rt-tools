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

/** Десять видов в светлой и тёмной половине — SC-UKV-1369. */
export const Themes: TStory = { args: { part: 'themes' } };
