import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTagComponent } from './component/test-tag.component';

export default {
    title: 'Components/Tag',
    component: TestRtTagComponent,
    argTypes: {
        value: { control: { type: 'text' } },
        severity: {
            options: ['info', 'success', 'warning', 'danger', 'secondary', 'neutral'],
            control: { type: 'select' },
        },
        shape: {
            options: ['pill', 'square'],
            control: { type: 'select' },
        },
        appearance: {
            options: ['solid', 'outlined'],
            control: { type: 'select' },
        },
        radius: { control: false },
        icon: { control: false },
        iconEnd: { control: false },
        closable: { control: { type: 'boolean' } },
    },
} as Meta<TestRtTagComponent>;

type Story = StoryObj<TestRtTagComponent>;

export const Default: Story = {
    args: {
        value: 'Значение',
        severity: 'neutral',
        shape: 'pill',
        appearance: 'solid',
        radius: null,
        icon: null,
        iconEnd: null,
        closable: false,
    },
};
