import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtTreeComponent } from './component/test-tree.component';

export default {
    title: 'Organisms/Forms/Tree',
    component: TestRtTreeComponent,
    argTypes: {
        mode: {
            options: ['multiple', 'single', 'none'],
            control: { type: 'select' },
        },
        cascade: { control: { type: 'boolean' } },
        searchTerm: { control: { type: 'text' } },
        showSelectAll: { control: { type: 'boolean' } },
        branchMarks: { control: { type: 'boolean' } },
        exclusive: { control: { type: 'boolean' } },
        filter: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
        nodes: { control: false },
        value: { control: false },
    },
} as Meta<TestRtTreeComponent>;

type TStory = StoryObj<TestRtTreeComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой «флажки» в матрице режимов'),
    args: {
        mode: 'multiple',
        cascade: true,
        searchTerm: '',
        showSelectAll: false,
        disabled: false,
    },
};
