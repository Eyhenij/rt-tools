import { Meta, StoryObj } from '@storybook/angular';

import { TestRtBarListStatesComponent } from './component/test-bar-list-states.component';

/** Ошибка загрузки и свои шаблоны по одобренному кадру. Контролов нет: все случаи рядом. */
export default {
    title: 'Molecules/Data/BarList',
    component: TestRtBarListStatesComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtBarListStatesComponent>;

type TStory = StoryObj<TestRtBarListStatesComponent>;

/** Ошибка загрузки, свои шаблоны пустого и ошибки. */
export const ErrorAndPlaceholders: TStory = { parameters: { snapshot: { fullPage: true } } };
