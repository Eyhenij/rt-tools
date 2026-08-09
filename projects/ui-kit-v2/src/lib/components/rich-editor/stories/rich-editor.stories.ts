import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
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
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        placeholder: 'Введите значение',
        toolbar: 'full',
    },
};
