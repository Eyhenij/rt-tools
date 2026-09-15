import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMoneyRowComponent } from './component/test-money-row.component';

export default {
    title: 'Molecules/Data/MoneyRow',
    component: TestRtMoneyRowComponent,
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        label: { control: { type: 'text' } },
        total: { control: { type: 'boolean' } },
        loading: { control: { type: 'boolean' } },
    },
} as Meta<TestRtMoneyRowComponent>;

type TStory = StoryObj<TestRtMoneyRowComponent>;

export const Playground: TStory = {
    args: {
        label: 'Сохранить',
        total: false,
        loading: false,
    },
};
