import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtHybridTreeSelectorComponent } from './component/test-hybrid-tree-selector.component';

export default {
    title: 'Organisms/Forms/HybridTreeSelector',
    component: TestRtHybridTreeSelectorComponent,
    argTypes: {
        confirm: { control: { type: 'boolean' } },
        expandControls: { control: { type: 'boolean' } },
        clearable: { control: { type: 'boolean' } },
        revertable: { control: { type: 'boolean' } },
        selectAll: { control: { type: 'boolean' } },
        branchMarks: { control: { type: 'boolean' } },
        label: { control: { type: 'text' } },
        searchTerm: { control: { type: 'text' } },
        nodes: { control: false },
        value: { control: false },
    },
} as Meta<TestRtHybridTreeSelectorComponent>;

type TStory = StoryObj<TestRtHybridTreeSelectorComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('подтверждаемая форма уже стоит ячейкой в матрице форм'),
    args: {
        confirm: true,
        expandControls: true,
        clearable: true,
        revertable: true,
        selectAll: true,
        branchMarks: true,
        label: 'Поля отчёта',
        searchTerm: '',
    },
};
