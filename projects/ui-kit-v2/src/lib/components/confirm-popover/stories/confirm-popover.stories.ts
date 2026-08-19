import { Meta, StoryObj } from '@storybook/angular';

import { TestRtConfirmPopoverComponent } from './component/test-confirm-popover.component';

export default {
    title: 'Molecules/ConfirmPopover',
    component: TestRtConfirmPopoverComponent,
    parameters: { snapshot: { fullPage: true } },
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

type TStory = StoryObj<TestRtConfirmPopoverComponent>;

export const Playground: TStory = {
    args: {
        message: 'Удалить запись? Действие необратимо.',
        title: 'Удаление',
        confirmLabel: 'Подтвердить',
        cancelLabel: 'Отмена',
        tone: 'danger',
    },
};
