import { Meta, StoryObj } from '@storybook/angular';

import { TestRtRichEditorComponent } from './component/test-rich-editor.component';

export default {
    title: 'Components/RichEditor',
    component: TestRtRichEditorComponent,
    argTypes: {
        placeholder: { control: { type: 'text' } },
        toolbar: {
            options: ['full', 'minimal'],
            control: { type: 'select' },
        },
    },
} as Meta<TestRtRichEditorComponent>;

type Story = StoryObj<TestRtRichEditorComponent>;

export const Playground: Story = {
    args: {
        placeholder: 'Введите значение',
        toolbar: 'full',
    },
};
