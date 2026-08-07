import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDatePickerComponent } from './component/test-date-picker.component';

export default {
    title: 'Components/DatePicker',
    component: TestRtDatePickerComponent,
    argTypes: {
        type: {
            options: ['date', 'datetime-local', 'time'],
            control: { type: 'select' },
        },
        min: { control: { type: 'text' } },
        max: { control: { type: 'text' } },
    },
} as Meta<TestRtDatePickerComponent>;

type Story = StoryObj<TestRtDatePickerComponent>;

export const Playground: Story = {
    args: {
        type: 'date',
        min: null,
        max: null,
    },
};
