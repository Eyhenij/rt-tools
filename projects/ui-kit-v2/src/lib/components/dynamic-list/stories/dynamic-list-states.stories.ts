import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDynamicListStatesComponent } from './component/test-dynamic-list-states.component';

/** Ошибка загрузки и свои шаблоны по одобренному кадру. Контролов нет: все случаи рядом. */
export default {
    title: 'Organisms/Table/DynamicList',
    component: TestRtDynamicListStatesComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDynamicListStatesComponent>;

type TStory = StoryObj<TestRtDynamicListStatesComponent>;

/** Ошибка загрузки, свои шаблоны пустого и ошибки. */
export const ErrorAndPlaceholders: TStory = { parameters: { snapshot: { fullPage: true } } };
