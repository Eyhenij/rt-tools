import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtMost } from '../../../../showcase';
import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { TestRtPageHeaderMatrixComponent } from './component/test-page-header-matrix.component';

/**
 * Пункт «Ещё» верхнего ряда `rt-page-header`: разделы, которым не хватило ширины ряда, и его
 * панель. Своих входов наружу у него нет — его ставит шапка, — поэтому история показывает шапку в
 * узком ящике, а не сам пункт.
 */
export default {
    title: 'Molecules/Navigation/PageHeaderMore',
    component: TestRtPageHeaderMatrixComponent,
    parameters: {
        controls: { disable: true },
        // «Ещё» живёт только в широкой разметке: на `@media (width <= 1080px)` ряд уходит в
        // бургер, и кадра на этом пороге ему не нужно.
        snapshot: { widths: [storyWidthAtMost(1380)] },
    },
} as Meta<TestRtPageHeaderMatrixComponent>;

type TStory = StoryObj<TestRtPageHeaderMatrixComponent>;

/**
 * Шапка в узком ящике: часть разделов ушла в «Ещё». Панель «Ещё» живёт в оверлее и до наведения
 * в документе её нет — открывает её `play`.
 */
export const More: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'more' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, {
            event: 'mouseenter',
            within: '[qa-dataid="header-nav-more"]',
            wait: 200,
        });
    },
};
