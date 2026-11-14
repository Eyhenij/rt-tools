import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDraggableTreeStatesComponent } from './component/test-draggable-tree-states.component';

/** Свой вид пустого по одобренному кадру. Контролов нет: все случаи рядом. */
export default {
    title: 'Organisms/Forms/DraggableTree',
    component: TestRtDraggableTreeStatesComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDraggableTreeStatesComponent>;

type TStory = StoryObj<TestRtDraggableTreeStatesComponent>;

/** Строка без шаблона и свой шаблон при пустом наборе узлов. */
export const OwnEmpty: TStory = { parameters: { snapshot: { fullPage: true } } };
