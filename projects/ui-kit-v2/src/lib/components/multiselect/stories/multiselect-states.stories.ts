import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { TestRtMultiselectStatesComponent } from './component/test-multiselect-states.component';

/** Свой вид пустого по одобренному кадру. Контролов нет: показывать нечего, кроме шаблона. */
export default {
    title: 'Molecules/Forms/Multiselect',
    component: TestRtMultiselectStatesComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtMultiselectStatesComponent>;

type TStory = StoryObj<TestRtMultiselectStatesComponent>;

/** Пустой набор опций и шаблон `rtMultiselectEmpty` в открытой панели. */
export const OwnEmpty: TStory = {
    parameters: { snapshot: { fullPage: true } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { key: 'ArrowDown' });
    },
};
