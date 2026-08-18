import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtFileListComponent } from './component/test-file-list.component';

export default {
    title: 'Components/FileList',
    component: TestRtFileListComponent,
    argTypes: {
        showActions: { control: { type: 'boolean' } },
        files: { control: false },
    },
} as Meta<TestRtFileListComponent>;

type TStory = StoryObj<TestRtFileListComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        showActions: true,
    },
};
