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
