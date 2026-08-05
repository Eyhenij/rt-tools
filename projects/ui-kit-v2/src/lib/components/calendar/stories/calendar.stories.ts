import { Meta, StoryObj } from '@storybook/angular';

import { TestRtCalendarComponent } from './component/test-calendar.component';

export default {
    title: 'Components/Calendar',
    component: TestRtCalendarComponent,
    argTypes: {
        months: { control: false },
        weekdayLabels: { control: false },
        canPrev: { control: { type: 'boolean' } },
        canNext: { control: { type: 'boolean' } },
        prevAriaLabel: { control: { type: 'text' } },
        nextAriaLabel: { control: { type: 'text' } },
        sublabelsLoading: { control: { type: 'boolean' } },
    },
} as Meta<TestRtCalendarComponent>;

type Story = StoryObj<TestRtCalendarComponent>;

export const Default: Story = {
    args: {
        months: [],
        weekdayLabels: ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'],
        canPrev: false,
        canNext: false,
        prevAriaLabel: '',
        nextAriaLabel: '',
        sublabelsLoading: false,
    },
};
