import { Meta, StoryObj } from '@storybook/angular';

import { TestRtPopoverComponent } from './component/test-popover.component';

export default {
    title: 'Components/Popover',
    component: TestRtPopoverComponent,
    argTypes: {
        trigger: {
            options: ['click', 'hover', 'manual'],
            control: { type: 'select' },
        },
        width: {
            options: ['trigger', 'auto'],
            control: { type: 'select' },
        },
        align: {
            options: ['start', 'end'],
            control: { type: 'select' },
        },
        fitViewport: { control: { type: 'boolean' } },
        panelClass: { control: { type: 'text' } },
        disabled: { control: { type: 'boolean' } },
        offsetY: { control: { type: 'number' } },
        offsetX: { control: { type: 'number' } },
    },
} as Meta<TestRtPopoverComponent>;

type Story = StoryObj<TestRtPopoverComponent>;

export const Playground: Story = {
    args: {
        trigger: 'click',
        width: 'auto',
        align: 'start',
        fitViewport: false,
        panelClass: '',
        disabled: false,
        offsetY: 4,
        offsetX: 0,
    },
};

/** Наведение вместо щелчка: панель держится, пока курсор на ней, и закрывается с отсрочкой. */
export const HoverTrigger: Story = {
    args: {
        ...Playground.args,
        trigger: 'hover',
    },
};
