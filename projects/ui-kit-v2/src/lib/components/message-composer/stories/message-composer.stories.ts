import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMessageComposerComponent } from './component/test-message-composer.component';

export default {
    title: 'Components/MessageComposer',
    component: TestRtMessageComposerComponent,
    argTypes: {
        placeholder: { control: { type: 'text' } },
        accept: { control: { type: 'text' } },
        attachments: { control: { type: 'boolean' } },
        sending: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
        formatting: { control: { type: 'boolean' } },
        toolbar: {
            options: ['full', 'minimal'],
            control: { type: 'select' },
        },
        minRows: { control: { type: 'number' } },
        maxRows: { control: { type: 'number' } },
        droppedFiles: { control: false },
    },
} as Meta<TestRtMessageComposerComponent>;

type Story = StoryObj<TestRtMessageComposerComponent>;

export const Default: Story = {
    args: {
        placeholder: 'Введите значение',
        accept: '',
        attachments: false,
        sending: false,
        disabled: false,
        formatting: false,
        toolbar: 'full',
        minRows: 1,
        maxRows: 6,
        droppedFiles: null,
    },
};
