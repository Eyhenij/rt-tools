import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDataListStatesComponent } from './component/test-data-list-states.component';

/** Ошибка загрузки и свои шаблоны по одобренному кадру. Контролов нет: все случаи рядом. */
export default {
    title: 'Organisms/Material Dynamic List/DataList',
    component: TestRtDataListStatesComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDataListStatesComponent>;

type TStory = StoryObj<TestRtDataListStatesComponent>;

/** Ошибка загрузки, свои шаблоны пустого и ошибки. */
export const ErrorAndPlaceholders: TStory = { parameters: { snapshot: { fullPage: true } } };
