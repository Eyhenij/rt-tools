import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtTreeSelectorComponent } from './component/test-tree-selector.component';

export default {
    title: 'Organisms/Forms/TreeSelector',
    component: TestRtTreeSelectorComponent,
    argTypes: {
        mode: { options: ['multiple', 'single', 'none'], control: { type: 'select' } },
        expandOnStart: { options: ['chosen', 'all', 'none'], control: { type: 'select' } },
        confirm: { control: { type: 'boolean' } },
        footer: { control: { type: 'boolean' } },
        emptyAllowed: { control: { type: 'boolean' } },
        expandControls: { control: { type: 'boolean' } },
        clearable: { control: { type: 'boolean' } },
        revertable: { control: { type: 'boolean' } },
        multiToggle: { control: { type: 'boolean' } },
        multiDefault: { control: { type: 'boolean' } },
        selectAll: { control: { type: 'boolean' } },
        label: { control: { type: 'text' } },
        searchTerm: { control: { type: 'text' } },
        nodes: { control: false },
        value: { control: false },
    },
} as Meta<TestRtTreeSelectorComponent>;

type TStory = StoryObj<TestRtTreeSelectorComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('подтверждаемая форма со всеми контролами уже стоит ячейкой в матрице форм'),
    args: {
        mode: 'multiple',
        confirm: true,
        expandControls: true,
        clearable: true,
        revertable: true,
        multiToggle: true,
        label: 'Гостиницы',
        searchTerm: '',
    },
};
