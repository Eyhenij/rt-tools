import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtNoteComponent } from './component/test-note.component';

export default {
    title: 'Components/Note',
    component: TestRtNoteComponent,
    argTypes: {
        text: { control: { type: 'text' } },
    },
} as Meta<TestRtNoteComponent>;

type TStory = StoryObj<TestRtNoteComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        text: 'Тариф меняется со следующего месяца.',
    },
};
