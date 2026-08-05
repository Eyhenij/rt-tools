import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDialogHeaderComponent } from './component/test-dialog-header.component';

export default {
    title: 'Components/DialogHeader',
    component: TestRtDialogHeaderComponent,
    argTypes: {
        title: { control: { type: 'text' } },
        closable: { control: { type: 'boolean' } },
    },
} as Meta<TestRtDialogHeaderComponent>;

type Story = StoryObj<TestRtDialogHeaderComponent>;

export const Default: Story = {
    args: {
        title: 'Заголовок',
        closable: true,
    },
};
