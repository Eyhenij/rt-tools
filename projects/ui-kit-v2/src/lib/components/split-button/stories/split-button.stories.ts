import { Meta, StoryObj } from '@storybook/angular';

import { TestRtSplitButtonComponent } from './component/test-split-button.component';

export default {
    title: 'Components/SplitButton',
    component: TestRtSplitButtonComponent,
    argTypes: {
        label: { control: { type: 'text' } },
        menuItems: { control: false },
        theme: { control: false },
        size: { control: false },
        menuAriaLabel: { control: { type: 'text' } },
        loading: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
    },
} as Meta<TestRtSplitButtonComponent>;

type Story = StoryObj<TestRtSplitButtonComponent>;

export const Default: Story = {
    args: {
        label: 'Сохранить',
        menuItems: [],
        theme: 'primary',
        size: 'md',
        menuAriaLabel: '',
        loading: false,
        disabled: false,
    },
};
