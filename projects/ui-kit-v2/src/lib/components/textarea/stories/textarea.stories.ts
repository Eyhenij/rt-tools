import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtTextareaComponent } from './component/test-textarea.component';

export default {
    title: 'Components/Textarea',
    component: TestRtTextareaComponent,
    argTypes: {
        placeholder: { control: { type: 'text' } },
        readonly: { control: { type: 'boolean' } },
        rows: { control: { type: 'number' } },
        resize: {
            options: ['none', 'vertical'],
            control: { type: 'select' },
        },
    },
} as Meta<TestRtTextareaComponent>;

type Story = StoryObj<TestRtTextareaComponent>;

export const Playground: Story = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        placeholder: 'Введите значение',
        readonly: false,
        rows: 3,
        resize: 'vertical',
    },
};
