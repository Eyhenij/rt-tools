import { Meta, StoryObj } from '@storybook/angular';

import { TestRtThreadListStatesComponent } from './component/test-thread-list-states.component';

/** Задержка поиска списка с запасом: строка поиска применяется после неё. */
const SEARCH_SETTLE_MS: number = 600;

/**
 * Ошибка загрузки и заглушки по одобренному кадру. Контролов нет: все случаи стоят рядом.
 */
export default {
    title: 'Organisms/Chat/ThreadList',
    component: TestRtThreadListStatesComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtThreadListStatesComponent>;

type TStory = StoryObj<TestRtThreadListStatesComponent>;

/** Загрузка, пусто, ничего не найдено, ошибка, ошибка догрузки, свои шаблоны пустого и ошибки. */
export const ErrorAndPlaceholders: TStory = {
    parameters: { snapshot: { fullPage: true } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await document.fonts.ready;
        const boxes: HTMLElement[] = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-story-search]'));
        for (const box of boxes) {
            const field: HTMLInputElement | null = box.querySelector<HTMLInputElement>('[qa-dataid="thread-list-search"] input');
            if (field !== null) {
                field.value = box.dataset['storySearch'] ?? '';
                field.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
        await new Promise<void>((resolve: () => void): void => {
            setTimeout(resolve, SEARCH_SETTLE_MS);
        });
        if (canvasElement.querySelectorAll('[qa-dataid="thread-list-nothing-found"]').length !== boxes.length) {
            throw new Error('Ничего не найдено: поиск не дошёл до списка');
        }
    },
};
