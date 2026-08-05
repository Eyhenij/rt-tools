import { Meta, StoryObj } from '@storybook/angular';

import { TestRtFileDropComponent } from './component/test-file-drop.component';

export default {
    title: 'Components/FileDrop',
    component: TestRtFileDropComponent,
    argTypes: {
        disabled: { control: { type: 'boolean' } },
        overlayLabel: { control: { type: 'text' } },
        zones: { control: false },
        accept: { control: { type: 'text' } },
    },
} as Meta<TestRtFileDropComponent>;

type Story = StoryObj<TestRtFileDropComponent>;

export const Default: Story = {
    args: {
        disabled: false,
        overlayLabel: '',
        zones: [],
        accept: '',
    },
};
