import { Meta, StoryObj } from '@storybook/angular';

import { CALENDAR_MONTH, CALENDAR_WEEKDAYS } from './component/calendar.fixture';
import { TestRtCalendarComponent } from './component/test-calendar.component';

export default {
    title: 'Molecules/Forms/Calendar',
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

type TStory = StoryObj<TestRtCalendarComponent>;

export const Default: TStory = {
    args: {
        months: [CALENDAR_MONTH],
        weekdayLabels: CALENDAR_WEEKDAYS,
        canPrev: true,
        canNext: true,
        prevAriaLabel: 'Предыдущий месяц',
        nextAriaLabel: 'Следующий месяц',
        sublabelsLoading: false,
    },
};
