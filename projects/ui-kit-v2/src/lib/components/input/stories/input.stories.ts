import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtInputComponent } from './component/test-input.component';

export default {
    title: 'Atoms/Forms/Input',
    component: TestRtInputComponent,
    argTypes: {
        type: {
            options: ['text', 'password', 'email', 'time'],
            control: { type: 'select' },
        },
        placeholder: { control: { type: 'text' } },
        iconLeft: { control: false },
        iconRight: { control: false },
        passwordToggle: { control: { type: 'boolean' } },
        autocomplete: { control: { type: 'text' } },
    },
} as Meta<TestRtInputComponent>;

type TStory = StoryObj<TestRtInputComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        type: 'text',
        placeholder: 'Введите значение',
        iconLeft: null,
        iconRight: null,
        passwordToggle: false,
        autocomplete: null,
    },
};
