import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMessageComponent } from './component/test-message.component';

export default {
    title: 'Components/Message',
    component: TestRtMessageComponent,
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        severity: {
            options: ['info', 'success', 'warning', 'danger', 'secondary', 'neutral'],
            control: { type: 'select' },
        },
        icon: { control: false },
        hideIcon: { control: { type: 'boolean' } },
        closable: { control: { type: 'boolean' } },
    },
} as Meta<TestRtMessageComponent>;

type TStory = StoryObj<TestRtMessageComponent>;

export const Default: TStory = {
    args: {
        severity: 'info',
        icon: null,
        hideIcon: false,
        closable: false,
    },
};
