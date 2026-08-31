import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtMost } from '../../../../showcase';
import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { TestRtPageHeaderMatrixComponent } from './component/test-page-header-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Navigation/PageHeader',
    component: TestRtPageHeaderMatrixComponent,
    parameters: {
        controls: { disable: true },
        // Шапка называет ширину сама: `@media (width <= 1380px)` прячет подписи пунктов, а
        // `@media (width <= 1080px)` убирает полосу в меню. Кадр порога — на каждом из них.
        snapshot: { widths: [storyWidthAtMost(1380), storyWidthAtMost(1080)] },
    },
} as Meta<TestRtPageHeaderMatrixComponent>;

type TStory = StoryObj<TestRtPageHeaderMatrixComponent>;

/** Виды пунктов: плоские ссылки против раздела с панелью второго уровня. */
export const Items: TStory = { args: { part: 'items' } };

/** Блок пользователя справа: без него, с инициалом, без инициала. */
export const User: TStory = { args: { part: 'user' } };

export const Themes: TStory = { args: { part: 'themes' } };

/**
 * Раскрытая панель второго уровня. Открывает её `play`-функция наведением: раздел с панелью
 * раскрывается по наведению, а до него панели в документе нет вовсе. Триггер здесь — не первая
 * кнопка полосы, поэтому аддону передан спуск до неё.
 */
export const Panel: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'panel' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, {
            event: 'mouseenter',
            within: '[qa-dataid="header-nav-trigger"]',
            wait: 200,
        });
    },
};

/**
 * Набор запроса в поле закреплённой панели. Состояние внутреннее — входом до него не доехать, —
 * а ждётся оно самим наступившим отбором, а не отсчётом времени: на занятой машине отсчёт
 * промахивается, и в кадр уходит непроверенный набор.
 */
async function searchInPinnedPanel(canvasElement: HTMLElement, query: string, settled: (root: HTMLElement) => boolean): Promise<void> {
    const field: HTMLInputElement | null = canvasElement.querySelector<HTMLInputElement>('[qa-dataid="header-nav-search"] input');
    if (field === null) {
        throw new Error('Поле поиска в закреплённой панели не отрисовано');
    }

    field.value = query;
    field.dispatchEvent(new Event('input', { bubbles: true }));

    for (let attempt: number = 0; attempt < 60; attempt += 1) {
        if (settled(canvasElement)) {
            return;
        }
        await new Promise<void>((resolve: () => void): void => {
            requestAnimationFrame((): void => resolve());
        });
    }

    throw new Error(`Отбор по запросу «${query}» до кадра не наступил`);
}

/**
 * Закреплённая мода: панель стоит второй строкой под полосой разделов, тени у неё нет, булавка
 * нажата. Раздел она берёт по открытому адресу — жеста здесь не нужно.
 */
export const PanelPinned: TStory = {
    // Кадр целой страницы: закреплённая панель рисуется самой шапкой, а не сеткой показа, и
    // корня `[data-story-root]` на странице нет.
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'pinned' },
};

/**
 * Отбор по подстроке подписи: из двух колонок осталась одна, ширина панели пересчитана.
 */
export const PanelSearchMatches: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'pinned' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await searchInPinnedPanel(
            canvasElement,
            'Курс',
            (root: HTMLElement): boolean => root.querySelectorAll('[qa-dataid="header-nav-column"]').length === 1
        );
    },
};

/** Совпадений нет: вместо колонок стоит строка о пустой выдаче. */
export const PanelSearchEmpty: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'pinned' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await searchInPinnedPanel(
            canvasElement,
            'такого пункта нет',
            (root: HTMLElement): boolean => root.querySelector('[qa-dataid="header-nav-empty"]') !== null
        );
    },
};
