import { Meta, StoryObj } from '@storybook/angular';

import { TestRtCardComponent } from './component/test-card.component';

export default {
    title: 'Molecules/Card',
    component: TestRtCardComponent,
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        header: { control: { type: 'text' } },
        ariaLabel: { control: { type: 'text' } },
        clickable: { control: { type: 'boolean' } },
    },
} as Meta<TestRtCardComponent>;

type TStory = StoryObj<TestRtCardComponent>;

export const Default: TStory = {
    args: {
        header: null,
        ariaLabel: null,
        clickable: false,
    },
};
