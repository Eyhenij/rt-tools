import { Meta, StoryObj } from '@storybook/angular';

import { TestRtActionBarComponent } from './component/test-action-bar.component';

/**
 * Страница входов полосы массовых действий.
 *
 * Полоса берёт настройку одним объектом, и контролами его не собрать: обёртка складывает его из
 * трёх ручек — сколько выбрано, сколько всего и какой список действий подать.
 */
export default {
    title: 'Molecules/Data/ActionBar',
    component: TestRtActionBarComponent,
    // Показ стоит не сеткой витрины, а одной полосой: корня показа на странице нет, и кадр
    // объявлен по целой странице.
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        kind: {
            control: 'inline-radio',
            options: ['plain', 'icons', 'menu'],
            description: 'Какой список действий подать',
        },
        selected: { control: { type: 'number', min: 0 } },
        total: { control: { type: 'number', min: 0 } },
    },
} as Meta<TestRtActionBarComponent>;

type TStory = StoryObj<TestRtActionBarComponent>;

export const Playground: TStory = {
    args: { selected: 3, total: 128, kind: 'plain' },
};
