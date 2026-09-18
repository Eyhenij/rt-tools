import { Meta, StoryObj } from '@storybook/angular';

import { TestRtActionBarHolderComponent } from './component/test-action-bar-holder.component';

/**
 * Держатель полосы: он приколот к окну, поэтому стоит в коробке, которая ему содержащий блок и
 * которая обрезает. Без коробки полоса легла бы поверх всего показа, а сама коробка осталась бы
 * в кадре пустой рамкой.
 */
export default {
    title: 'Molecules/Data/ActionBarHolder',
    component: TestRtActionBarHolderComponent,
    // Держатель приколот к окну и стоит в своей коробке: корня показа на странице нет, и кадр
    // объявлен по целой странице.
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        selected: { control: { type: 'number', min: 0 } },
        total: { control: { type: 'number', min: 0 } },
    },
} as Meta<TestRtActionBarHolderComponent>;

type TStory = StoryObj<TestRtActionBarHolderComponent>;

export const Playground: TStory = {
    args: { selected: 3, total: 128 },
};
