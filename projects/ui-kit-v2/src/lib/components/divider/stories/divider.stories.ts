import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtDividerComponent } from './component/test-divider.component';

export default {
    title: 'Atoms/Divider',
    component: TestRtDividerComponent,
    argTypes: {
        vertical: { control: { type: 'boolean' } },
        inset: { control: { type: 'boolean' } },
    },
} as Meta<TestRtDividerComponent>;

type TStory = StoryObj<TestRtDividerComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        vertical: false,
        inset: false,
    },
};
