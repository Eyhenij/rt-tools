import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtHybridTreeComponent } from './component/test-hybrid-tree.component';

export default {
    title: 'Organisms/Forms/HybridTree',
    component: TestRtHybridTreeComponent,
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
        disabled: { control: { type: 'boolean' } },
        nodes: { control: false },
        value: { control: false },
    },
} as Meta<TestRtHybridTreeComponent>;

type TStory = StoryObj<TestRtHybridTreeComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('выбор по листу в группах уже стоит ячейкой матрицы групп «один лист»'),
    args: {
        mode: 'multiple',
        cascade: true,
        searchTerm: '',
        showSelectAll: true,
        branchMarks: true,
        exclusive: false,
        disabled: false,
    },
};
