import { Meta, StoryObj } from '@storybook/angular';

import { TestRtThemeToggleComponent } from './component/test-theme-toggle.component';

export default {
    title: 'Components/ThemeToggle',
    component: TestRtThemeToggleComponent,
    argTypes: {
        appearance: {
            options: ['icon', 'switch'],
            control: { type: 'select' },
        },
    },
} as Meta<TestRtThemeToggleComponent>;

type Story = StoryObj<TestRtThemeToggleComponent>;

export const Default: Story = {
    args: {
        appearance: 'icon',
    },
};
