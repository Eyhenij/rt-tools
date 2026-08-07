import { Meta, StoryObj } from '@storybook/angular';

import { TestRtFieldComponent } from './component/test-field.component';

export default {
    title: 'Components/Field',
    component: TestRtFieldComponent,
    argTypes: {
        label: { control: { type: 'text' } },
        hint: { control: { type: 'text' } },
        help: { control: { type: 'text' } },
        readonly: { control: { type: 'boolean' } },
        loading: { control: { type: 'boolean' } },
        hideRequiredMark: { control: { type: 'boolean' } },
        reserveHintSpace: { control: { type: 'boolean' } },
        errors: { control: false },
    },
} as Meta<TestRtFieldComponent>;

type Story = StoryObj<TestRtFieldComponent>;

export const Playground: Story = {
    args: {
        label: 'Сохранить',
        hint: 'Подсказка',
        help: '',
        readonly: false,
        loading: false,
        hideRequiredMark: false,
        reserveHintSpace: false,
        errors: {},
    },
};
