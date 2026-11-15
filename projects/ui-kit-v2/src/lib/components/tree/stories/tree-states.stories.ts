import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTreeStatesComponent } from './component/test-tree-states.component';

/** Свой вид пустого по одобренному кадру. Контролов нет: все случаи рядом. */
export default {
    title: 'Organisms/Forms/Tree',
    component: TestRtTreeStatesComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTreeStatesComponent>;

type TStory = StoryObj<TestRtTreeStatesComponent>;

/** Строка без шаблона, свой шаблон при пустом наборе и при поиске без совпадений. */
export const OwnEmpty: TStory = { parameters: { snapshot: { fullPage: true } } };
