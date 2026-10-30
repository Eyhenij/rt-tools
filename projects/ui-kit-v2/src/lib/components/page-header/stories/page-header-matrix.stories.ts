import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtMost } from '../../../../showcase';
import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { STORY_PHONE_VIEWPORT } from '../../../../showcase/story-snapshot';
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

/**
 * Меню профиля на телефоне: открыто нажатием на имя и стоит на подложке меню разделов. Окно
 * узкое с первого кадра — поповер берёт класс подложки при первом открытии.
 */
export const UserMenuNarrow: TStory = {
    args: { part: 'user-menu' },
    globals: { viewport: { value: 'narrow' } },
    parameters: { snapshot: { fullPage: true, viewport: STORY_PHONE_VIEWPORT } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { event: 'click', within: '[qa-dataid="header-user-menu"]', wait: 200 });
    },
};

/**
 * Меню профиля на низком окне — телефон боком, невысокое окно ноутбука. Меню кончается у нижнего
 * края и прокручивается по вертикали; `play` проверяет это в браузере на настоящем меню, а не на
 * входе поповера, и оставляет меню прокрученным до последнего пункта.
 */
export const UserMenuLow: TStory = {
    args: { part: 'user-menu' },
    parameters: { snapshot: { fullPage: true, viewport: { width: 1440, height: 400 }, widths: [] } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { event: 'click', within: '[qa-dataid="header-user-menu"]', wait: 200 });

        const page: Document = canvasElement.ownerDocument;
        const windowHeight: number = page.documentElement.clientHeight;
        const menu: HTMLElement | null = page.querySelector('.rt-popover-panel > .rt-profile-menu');
        const last: HTMLElement | null = menu?.querySelector('[qa-dataid="profile-logout"]') ?? null;
        if (menu === null || last === null) {
            throw new Error('Меню профиля не открылось нажатием на имя: проверять нечего');
        }
        if (menu.getBoundingClientRect().bottom > windowHeight) {
            throw new Error(`Меню уходит за нижний край: ${menu.getBoundingClientRect().bottom} при окне ${windowHeight}`);
        }
        // Строки выступают в поле отступа, поэтому ширина содержимого больше ширины меню и это не
        // поломка; поломка — если человек может сдвинуть меню вбок, то есть прокрутка по
        // горизонтали не выключена.
        const sideways: string = getComputedStyle(menu).overflowX;
        if (menu.scrollWidth > menu.clientWidth && sideways !== 'hidden' && sideways !== 'clip') {
            throw new Error(`Меню сдвигается по горизонтали: содержимое ${menu.scrollWidth} при ширине ${menu.clientWidth}`);
        }

        // Без прокрутки панель просто обрезает низ меню: высота меню остаётся в окне, а содержимое
        // под ней недостижимо. Поэтому проверяется, что прокрутка доходит до конца содержимого.
        menu.scrollTop = menu.scrollHeight;
        await new Promise<void>((resolve: () => void): void => {
            requestAnimationFrame((): void => resolve());
        });
        if (menu.scrollTop + menu.clientHeight < menu.scrollHeight - 1) {
            throw new Error(`Низ меню не достаётся прокруткой: ${menu.scrollTop + menu.clientHeight} из ${menu.scrollHeight}`);
        }
        if (last.getBoundingClientRect().bottom > menu.getBoundingClientRect().bottom + 1) {
            throw new Error('Пункт «Выйти» не достаётся вертикальной прокруткой');
        }
    },
};

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
