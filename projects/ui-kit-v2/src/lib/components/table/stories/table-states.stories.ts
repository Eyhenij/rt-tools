import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTableStatesComponent } from './component/test-table-states.component';

/** Ошибка загрузки и свои шаблоны по одобренному кадру. Контролов нет: все случаи рядом. */
export default {
    title: 'Organisms/Table/Table',
    component: TestRtTableStatesComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTableStatesComponent>;

type TStory = StoryObj<TestRtTableStatesComponent>;

/** Ошибка загрузки, свои шаблоны пустого и ошибки. */
export const ErrorAndPlaceholders: TStory = { parameters: { snapshot: { fullPage: true } } };
