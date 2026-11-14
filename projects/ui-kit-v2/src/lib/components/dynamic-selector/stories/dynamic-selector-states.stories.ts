import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDynamicSelectorStatesComponent } from './component/test-dynamic-selector-states.component';

/** Ошибка загрузки и свои шаблоны по одобренному кадру. Контролов нет: все случаи рядом. */
export default {
    title: 'Molecules/Forms/DynamicSelector',
    component: TestRtDynamicSelectorStatesComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDynamicSelectorStatesComponent>;

type TStory = StoryObj<TestRtDynamicSelectorStatesComponent>;

/** Ошибка загрузки, свои шаблоны пустого и ошибки в окне выбора. */
export const ErrorAndPlaceholders: TStory = { parameters: { snapshot: { fullPage: true } } };
