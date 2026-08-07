import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
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

/**
 * Наведение вместо щелчка: панель держится, пока курсор на ней, и закрывается с отсрочкой.
 *
 * Наведение посылает `play`: без него история рисовала кнопку с закрытой панелью, то есть ровно
 * то же, что `Playground`, — режим объявлен входом и ничем не показан. Жест уходит самой кнопке:
 * директива слушает `mouseenter` на своём хосте.
 */
export const HoverTrigger: Story = {
    args: {
        ...Playground.args,
        trigger: 'hover',
    },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { event: 'mouseenter' });
    },
};
