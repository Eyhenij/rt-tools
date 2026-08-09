import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtMost } from '../../../../showcase';
import { TestRtCalendarComponent } from './component/test-calendar.component';

export default {
    title: 'Components/Calendar',
    component: TestRtCalendarComponent,
    // Показ рисует не сетка витрины, поэтому кадр целой страницей. Календарь называет ширину
    // сам: на 640 сетка дней сжимается, на 374 — уходят подписи месяцев.
    parameters: { snapshot: { fullPage: true, widths: [storyWidthAtMost(640), storyWidthAtMost(374)] } },
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
