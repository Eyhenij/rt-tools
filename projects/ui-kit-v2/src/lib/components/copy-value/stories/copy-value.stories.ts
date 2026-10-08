import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtCopyValueComponent } from './component/test-copy-value.component';

export default {
    title: 'Molecules/CopyValue',
    component: TestRtCopyValueComponent,
    argTypes: {
        value: { control: { type: 'text' } },
        label: { control: { type: 'text' } },
        copyLabel: { control: { type: 'text' } },
    },
} as Meta<TestRtCopyValueComponent>;

type TStory = StoryObj<TestRtCopyValueComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значение с подписью уже стоит ячейкой в матрице этого компонента'),
    args: {
        value: '8f3c2a91-4d7e',
        label: 'Reference',
        copyLabel: 'Copy reference',
    },
};
