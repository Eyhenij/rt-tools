import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
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

type TStory = StoryObj<TestRtCalendarComponent>;

export const Default: TStory = {
    parameters: storySnapshotSkip(
        'обёртка отдаёт пустой `months`, и в кадре только стрелки перелистывания; пустой показ покрытием не считается, наполнение — волна покрытия составных компонентов'
    ),
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
