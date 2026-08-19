import { Meta, StoryObj } from '@storybook/angular';

import { TestRtHeaderComponent } from './component/test-header.component';

export default {
    title: 'Organisms/Layout/Header',
    component: TestRtHeaderComponent,
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        canGoBack: { control: { type: 'boolean' } },
        showInvite: { control: { type: 'boolean' } },
    },
} as Meta<TestRtHeaderComponent>;

type TStory = StoryObj<TestRtHeaderComponent>;

export const Default: TStory = {
    args: {
        canGoBack: false,
        showInvite: false,
    },
};
