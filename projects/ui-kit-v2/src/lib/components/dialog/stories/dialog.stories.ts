import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDialogComponent } from './component/test-dialog.component';

export default {
    title: 'Components/Dialog',
    component: TestRtDialogComponent,
    argTypes: {
        size: {
            options: ['sm', 'md', 'lg'],
            control: { type: 'select' },
        },
        width: { control: { type: 'text' } },
        ariaLabel: { control: { type: 'text' } },
    },
} as Meta<TestRtDialogComponent>;

type Story = StoryObj<TestRtDialogComponent>;

export const Playground: Story = {
    args: {
        size: 'md',
        width: null,
        ariaLabel: null,
    },
};
