import { Meta, StoryObj } from '@storybook/angular';

import { TestRtConfirmPopoverComponent } from './component/test-confirm-popover.component';

export default {
    title: 'Components/ConfirmPopover',
    component: TestRtConfirmPopoverComponent,
    argTypes: {
        message: { control: { type: 'text' } },
        title: { control: { type: 'text' } },
        confirmLabel: { control: { type: 'text' } },
        cancelLabel: { control: { type: 'text' } },
        tone: {
            options: ['danger', 'warning', 'primary'],
            control: { type: 'select' },
        },
    },
} as Meta<TestRtConfirmPopoverComponent>;

type Story = StoryObj<TestRtConfirmPopoverComponent>;

export const Playground: Story = {
    args: {
        message: 'Удалить запись? Действие необратимо.',
        title: 'Удаление',
        confirmLabel: 'Подтвердить',
        cancelLabel: 'Отмена',
        tone: 'danger',
    },
};
