import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { TestRtSelectStatesComponent } from './component/test-select-states.component';

/** Свой вид пустого по одобренному кадру. Контролов нет: показывать нечего, кроме шаблона. */
export default {
    title: 'Molecules/Forms/Select',
    component: TestRtSelectStatesComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtSelectStatesComponent>;

type TStory = StoryObj<TestRtSelectStatesComponent>;

/** Пустой набор опций и шаблон `rtSelectEmpty` в открытой панели. */
export const OwnEmpty: TStory = {
    parameters: { snapshot: { fullPage: true } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { key: 'ArrowDown' });
    },
};
