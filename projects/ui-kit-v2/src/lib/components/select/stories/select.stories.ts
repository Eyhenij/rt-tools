import { Meta, StoryObj } from '@storybook/angular';

import { TestRtSelectComponent } from './component/test-select.component';

export default {
    title: 'Components/Select',
    component: TestRtSelectComponent,
    argTypes: {
        options: { control: false },
        placeholder: { control: { type: 'text' } },
        iconLeft: { control: false },
        filter: { control: { type: 'boolean' } },
        filterPlaceholder: { control: { type: 'text' } },
    },
} as Meta<TestRtSelectComponent>;

type Story = StoryObj<TestRtSelectComponent>;

export const Default: Story = {
    args: {
        options: [],
        placeholder: 'Введите значение',
        iconLeft: null,
        filter: false,
        filterPlaceholder: '',
    },
};
