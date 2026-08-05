import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMenuItemComponent } from './component/test-menu-item.component';

export default {
    title: 'Components/MenuItem',
    component: TestRtMenuItemComponent,
    argTypes: {
        icon: { control: false },
        label: { control: { type: 'text' } },
        danger: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
        confirmMessage: { control: { type: 'text' } },
        confirmTitle: { control: { type: 'text' } },
        confirmLabel: { control: { type: 'text' } },
        confirmCancelLabel: { control: { type: 'text' } },
        confirmTone: {
            options: ['danger', 'warning', 'primary'],
            control: { type: 'select' },
        },
    },
} as Meta<TestRtMenuItemComponent>;

type Story = StoryObj<TestRtMenuItemComponent>;

export const Default: Story = {
    args: {
        icon: null,
        label: 'Сохранить',
        danger: false,
        disabled: false,
        confirmMessage: '',
        confirmTitle: null,
        confirmLabel: 'Подтвердить',
        confirmCancelLabel: '',
        confirmTone: 'danger',
    },
};
