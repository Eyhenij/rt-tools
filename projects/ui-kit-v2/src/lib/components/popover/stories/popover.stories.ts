import { Meta, StoryObj } from '@storybook/angular';

import { TestRtPopoverComponent } from './component/test-popover.component';

export default {
    title: 'Components/Popover',
    component: TestRtPopoverComponent,
    argTypes: {
        template: { control: false },
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
        context: { control: false },
        panelClass: { control: { type: 'text' } },
        disabled: { control: { type: 'boolean' } },
        offsetY: { control: { type: 'number' } },
        offsetX: { control: { type: 'number' } },
    },
} as Meta<TestRtPopoverComponent>;

type Story = StoryObj<TestRtPopoverComponent>;

export const Default: Story = {
    args: {
        template: null,
        trigger: 'click',
        width: 'auto',
        align: 'start',
        fitViewport: false,
        context: null,
        panelClass: '',
        disabled: false,
        offsetY: 4,
        offsetX: 0,
    },
};
