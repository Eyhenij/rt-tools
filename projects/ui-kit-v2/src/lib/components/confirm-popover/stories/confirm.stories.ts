import { Meta, StoryObj } from '@storybook/angular';

import { TestRtConfirmComponent } from './component/test-confirm.component';

export default {
    title: 'Components/Confirm',
    component: TestRtConfirmComponent,
    argTypes: {
        message: { control: { type: 'text' } },
        title: { control: { type: 'text' } },
        label: { control: { type: 'text' } },
        cancelLabel: { control: { type: 'text' } },
        tone: {
            options: ['danger', 'warning', 'primary'],
            control: { type: 'select' },
        },
        disabled: { control: { type: 'boolean' } },
    },
} as Meta<TestRtConfirmComponent>;

type Story = StoryObj<TestRtConfirmComponent>;

export const Default: Story = {
    args: {
        message: 'Сообщение',
        title: 'Заголовок',
        label: 'Сохранить',
        cancelLabel: 'Отмена',
        tone: 'danger',
        disabled: false,
    },
};
