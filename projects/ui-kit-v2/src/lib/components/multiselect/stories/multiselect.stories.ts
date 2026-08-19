import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtMultiselectComponent } from './component/test-multiselect.component';

export default {
    title: 'Molecules/Forms/Multiselect',
    component: TestRtMultiselectComponent,
    argTypes: {
        options: { control: false },
        placeholder: { control: { type: 'text' } },
        maxChips: { control: { type: 'number' } },
    },
} as Meta<TestRtMultiselectComponent>;

type TStory = StoryObj<TestRtMultiselectComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        placeholder: 'Выберите города',
        maxChips: 3,
    },
};
