import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTabComponent } from './component/test-tab.component';

export default {
    title: 'Components/Tab',
    component: TestRtTabComponent,
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

type Story = StoryObj<TestRtTabComponent>;

export const Default: Story = {
    args: {
        id: '',
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
