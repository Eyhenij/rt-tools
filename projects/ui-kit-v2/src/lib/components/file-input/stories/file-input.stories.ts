import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtFileInputComponent } from './component/test-file-input.component';

export default {
    title: 'Components/FileInput',
    component: TestRtFileInputComponent,
    argTypes: {
        multiple: { control: { type: 'boolean' } },
        accept: { control: { type: 'text' } },
        directory: { control: { type: 'boolean' } },
        buttonLabel: { control: { type: 'text' } },
    },
} as Meta<TestRtFileInputComponent>;

type Story = StoryObj<TestRtFileInputComponent>;

export const Playground: Story = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        multiple: false,
        accept: null,
        directory: false,
        buttonLabel: '',
    },
};
