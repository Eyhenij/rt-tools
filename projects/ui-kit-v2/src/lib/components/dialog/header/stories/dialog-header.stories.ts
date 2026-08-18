import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../../showcase';
import { TestRtDialogHeaderComponent } from './component/test-dialog-header.component';

export default {
    title: 'Components/DialogHeader',
    component: TestRtDialogHeaderComponent,
    argTypes: {
        title: { control: { type: 'text' } },
        closable: { control: { type: 'boolean' } },
    },
} as Meta<TestRtDialogHeaderComponent>;

type TStory = StoryObj<TestRtDialogHeaderComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        title: 'Заголовок',
        closable: true,
    },
};
