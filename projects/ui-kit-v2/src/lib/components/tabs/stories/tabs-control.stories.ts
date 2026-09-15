import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTabsControlComponent } from './component/test-tabs-control.component';

export default {
    title: 'Molecules/Navigation/TabsControl',
    component: TestRtTabsControlComponent,
    // Показ рисует не сетка витрины, а сам составной компонент, поэтому кадр целой страницей.
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        side: {
            options: ['left', 'right'],
            control: { type: 'select' },
        },
    },
} as Meta<TestRtTabsControlComponent>;

type TStory = StoryObj<TestRtTabsControlComponent>;

export const Playground: TStory = {
    args: {
        side: 'right',
    },
};
