import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDetailRowComponent } from './component/test-detail-row.component';

export default {
    title: 'Molecules/Data/DetailRow',
    component: TestRtDetailRowComponent,
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        label: { control: { type: 'text' } },
        loading: { control: { type: 'boolean' } },
    },
} as Meta<TestRtDetailRowComponent>;

type TStory = StoryObj<TestRtDetailRowComponent>;

export const Playground: TStory = {
    args: {
        label: 'Сохранить',
        loading: false,
    },
};
