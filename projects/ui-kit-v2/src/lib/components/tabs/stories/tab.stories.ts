import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTabComponent } from './component/test-tab.component';

export default {
    title: 'Molecules/Navigation/Tab',
    component: TestRtTabComponent,
    // Показ рисует не сетка витрины, а сам составной компонент, поэтому кадр целой страницей.
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        id: { control: false },
        label: { control: { type: 'text' } },
        titleTemplate: { control: false },
        icon: { control: false },
        iconColor: { control: false },
        badge: { control: { type: 'text' } },
        disabled: { control: { type: 'boolean' } },
        hidden: { control: { type: 'boolean' } },
        invalid: { control: { type: 'boolean' } },
        invalidMessage: { control: { type: 'text' } },
    },
} as Meta<TestRtTabComponent>;

type TStory = StoryObj<TestRtTabComponent>;

export const Default: TStory = {
    args: {
        id: 'first',
        label: 'Сохранить',
        titleTemplate: null,
        icon: null,
        iconColor: 'current',
        badge: null,
        disabled: false,
        hidden: false,
        invalid: false,
        invalidMessage: '',
    },
};
