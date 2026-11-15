import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTreeSelectorStatesComponent } from './component/test-tree-selector-states.component';

/** Свой вид пустого по одобренному кадру. Контролов нет: все случаи рядом. */
export default {
    title: 'Molecules/Forms/TreeSelector',
    component: TestRtTreeSelectorStatesComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTreeSelectorStatesComponent>;

type TStory = StoryObj<TestRtTreeSelectorStatesComponent>;

/** Строка без шаблона, свой шаблон при пустом наборе и при поиске без совпадений. */
export const OwnEmpty: TStory = { parameters: { snapshot: { fullPage: true } } };
