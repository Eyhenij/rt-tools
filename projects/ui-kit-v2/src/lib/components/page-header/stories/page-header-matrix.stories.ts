import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtMost } from '../../../../showcase';
import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { PAGE_HEADER_COMPACT_SCROLL_ATTRIBUTE, TestRtPageHeaderMatrixComponent } from './component/test-page-header-matrix.component';

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

export const Presets: TStory = { args: { part: 'presets' } };

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
 * Сжатая полоса. Шапка липнет к верху обёртки и сжимается, только когда её место в потоке ушло
 * выше видимого положения, поэтому `play` прокручивает обёртку и ждёт, пока шапка это заметит.
 */
export const Compact: TStory = {
    args: { part: 'compact' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        const scroller: HTMLElement | null = canvasElement.querySelector(`[${PAGE_HEADER_COMPACT_SCROLL_ATTRIBUTE}]`);
        if (scroller === null) {
            throw new Error('история сжатой полосы: прокручиваемой обёртки в показе нет');
        }
        scroller.scrollTop = 240;
        // Наблюдатель пересечения отвечает не в том же кадре: сжатие ждётся по классу хоста,
        // а не отсчётом времени, и предел — на случай, если шапка так и не прилипла.
        for (let frame: number = 0; frame < 30; frame += 1) {
            if (canvasElement.querySelector('.rt-page-header--is-compact') !== null) {
                return;
            }
            await new Promise<void>((resolve: () => void): void => {
                requestAnimationFrame((): void => resolve());
            });
        }
        throw new Error('история сжатой полосы: после прокрутки шапка не сжалась');
    },
};
