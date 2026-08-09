import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
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
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        type: 'date',
        min: null,
        max: null,
    },
};
