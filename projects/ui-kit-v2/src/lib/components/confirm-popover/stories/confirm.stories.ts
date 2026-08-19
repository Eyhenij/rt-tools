import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtConfirmComponent } from './component/test-confirm.component';

export default {
    title: 'Organisms/Dialog/Confirm',
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

type TStory = StoryObj<TestRtConfirmComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        message: 'Удалить запись? Действие необратимо.',
        title: 'Удаление',
        label: 'Удалить',
        cancelLabel: 'Отмена',
        tone: 'danger',
        disabled: false,
    },
};
